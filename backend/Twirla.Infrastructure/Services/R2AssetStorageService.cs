using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;

namespace Twirla.Infrastructure.Services;

/// <summary>
/// Cloudflare R2 (S3-compatible) storage for shop images uploaded via shop builder.
/// Configure via <c>TWIRLA_R2_*</c> env vars or <c>R2:*</c> in appsettings.
/// </summary>
public sealed class R2AssetStorageService
{
    private readonly string? _accountId;
    private readonly string? _accessKeyId;
    private readonly string? _secretAccessKey;
    private readonly string? _bucketName;
    private readonly string? _publicBaseUrl;

    public R2AssetStorageService(IConfiguration configuration)
    {
        _accountId = FirstNonEmpty(
            Environment.GetEnvironmentVariable("TWIRLA_R2_ACCOUNT_ID"),
            configuration["R2:AccountId"]);
        _accessKeyId = FirstNonEmpty(
            Environment.GetEnvironmentVariable("TWIRLA_R2_ACCESS_KEY_ID"),
            configuration["R2:AccessKeyId"]);
        _secretAccessKey = FirstNonEmpty(
            Environment.GetEnvironmentVariable("TWIRLA_R2_SECRET_ACCESS_KEY"),
            configuration["R2:SecretAccessKey"]);
        _bucketName = FirstNonEmpty(
            Environment.GetEnvironmentVariable("TWIRLA_R2_BUCKET_NAME"),
            configuration["R2:BucketName"]);
        _publicBaseUrl = FirstNonEmpty(
            Environment.GetEnvironmentVariable("TWIRLA_R2_PUBLIC_BASE_URL"),
            configuration["R2:PublicBaseUrl"])?.TrimEnd('/');
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_accountId)
        && !string.IsNullOrWhiteSpace(_accessKeyId)
        && !string.IsNullOrWhiteSpace(_secretAccessKey)
        && !string.IsNullOrWhiteSpace(_bucketName)
        && !string.IsNullOrWhiteSpace(_publicBaseUrl);

    public async Task<AssetUploadResult> UploadAsync(
        Stream content,
        string contentType,
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("R2 is not configured (set TWIRLA_R2_* environment variables).");

        var key = objectKey.Trim().TrimStart('/');
        using var client = CreateClient();
        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = content,
            ContentType = contentType,
            DisablePayloadSigning = true,
            DisableDefaultChecksumValidation = true,
        };

        await client.PutObjectAsync(request, cancellationToken);
        return new AssetUploadResult(key, $"{_publicBaseUrl}/{key}");
    }

    private AmazonS3Client CreateClient()
    {
        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{_accountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true,
        };
        return new AmazonS3Client(_accessKeyId, _secretAccessKey, config);
    }

    private static string? FirstNonEmpty(params string?[] values)
    {
        foreach (var v in values)
        {
            if (!string.IsNullOrWhiteSpace(v))
                return v.Trim();
        }
        return null;
    }
}

public sealed record AssetUploadResult(string Key, string PublicUrl);
