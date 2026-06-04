import json
from pathlib import Path

URBAN_GLOW = {
    "shopId": "urban-glow-n5q8s3u7v2",
    "slug": "urban-glow",
    "name": "Urban Glow",
    "expiresAt": "2027-12-31T23:59:59Z",
    "adminToken": "urban-glow-admin-4b8f1e9d6c3a",
    "playCooldownHours": 24,
    "branding": {
        "primaryColor": "#db2777",
        "secondaryColor": "#fce7f3",
        "accentColor": "#f472b6",
        "logoUrl": "/logos/urban-glow.png",
        "brandName": "Urban Glow",
        "backgroundMode": "light",
        "theme": {
            "backgroundPattern": "gradient",
            "surfaceStyle": "glass",
            "ambientMotion": "pulse",
            "borderRadius": 24,
            "buttonRadius": 999,
        },
    },
    "text": {
        "title": "Play to unlock your beauty deal",
        "subtitle": "Makeup, skincare and bestsellers from Urban Glow — win discounts and order through Instagram DM.",
        "ctaText": "Shop via DM",
        "resultTitle": "Glow unlocked!",
        "resultSubtitle": "Your offer is ready — send us the code in DM to place your order.",
        "translations": {
            "sq": {
                "title": "Luaj dhe zhblloko ofertën tënde",
                "subtitle": "Grim, kujdes për lëkurën dhe produktet më të kërkuara nga Urban Glow — fito zbritje dhe porosit përmes DM në Instagram.",
                "ctaText": "Porosit në DM",
                "resultTitle": "Glow i zhbllokuar!",
                "resultSubtitle": "Oferta jote është gati — na dërgo kodin në DM për të porositur.",
            }
        },
    },
    "cta": {"url": "https://instagram.com/urban.glow"},
    "wheel": {
        "allowRepeatSpins": False,
        "prizes": [
            {
                "label": "15% off your order",
                "weight": 22,
                "description": "Valid on all makeup and skincare (details via DM).",
                "translations": {
                    "sq": {
                        "label": "15% zbritje në porosi",
                        "description": "Vlen për të gjithë grimrin dhe kujdesin për lëkurën (detajet në DM).",
                    }
                },
            },
            {
                "label": "Free delivery",
                "weight": 20,
                "description": "On orders over 2,000 ALL.",
                "translations": {
                    "sq": {
                        "label": "Dërgesë falas",
                        "description": "Për porosi mbi 2,000 ALL.",
                    }
                },
            },
            {
                "label": "Free mini lip gloss",
                "weight": 18,
                "description": "Travel-size Rose Quartz gloss — while stocks last.",
                "translations": {
                    "sq": {
                        "label": "Shkelqyes buzësh mini falas",
                        "description": "Shkelqyes buzësh Rose Quartz në madhësi udhëtimi — sa kohë ka stok.",
                    }
                },
            },
            {
                "label": "10% off skincare duo",
                "weight": 15,
                "description": "Cleanser + Vitamin C serum bundle.",
                "translations": {
                    "sq": {
                        "label": "10% zbritje për set skincare",
                        "description": "Paketë pastrues + serum Vitamin C.",
                    }
                },
            },
            {
                "label": "Try again tomorrow",
                "weight": 15,
                "isWinning": False,
                "description": "No prize today — come back after the cooldown.",
                "translations": {
                    "sq": {
                        "label": "Provo përsëri nesër",
                        "description": "Sot pa çmim — kthehu pas afatit të lojës.",
                    }
                },
            },
            {
                "label": "Not this round",
                "weight": 10,
                "isWinning": False,
                "description": "Close one — better luck on your next visit.",
                "translations": {
                    "sq": {
                        "label": "Jo në këtë raund",
                        "description": "Pak fat — provo herën tjetër.",
                    }
                },
            },
        ],
    },
    "tapHearts": {
        "heartsToTap": 10,
        "heartColor": "#db2777",
        "revealText": "UG-HEARTS — 12% off lip products",
        "revealSubtitle": "DM your screenshot + code within 7 days",
        "translations": {
            "sq": {
                "revealText": "UG-HEARTS — 12% zbritje për produktet e buzëve",
                "revealSubtitle": "Dërgo screenshot + kodin në DM brenda 7 ditëve",
            }
        },
    },
    "scratch": {
        "overlayColor": "#d4c4cb",
        "overlayText": "Scratch for your glow deal",
        "revealText": "20% off Vitamin C serum",
        "revealSubtitle": "Code UG-SCRATCH-20 — one use per customer",
        "translations": {
            "sq": {
                "overlayText": "Gërvisht për ofertën tënde",
                "revealText": "20% zbritje për serum Vitamin C",
                "revealSubtitle": "Kodi UG-SCRATCH-20 — një përdorim për klient",
            }
        },
    },
    "countdown": {
        "endAt": "2028-03-20T12:00:00Z",
        "endMessage": "Spring Glow Sale ends soon — game winners get an extra 5% if they order before the timer.",
        "showCtaBeforeEnd": True,
        "translations": {
            "sq": {
                "endMessage": "Shitja Spring Glow mbaron së shpejti — fituesit e lojës marrin edhe 5% shtesë nëse porosisin para kohës."
            }
        },
    },
    "memory": {
        "pairCount": 6,
        "pairLabels": ["💄", "✨", "🧴", "💋", "🌸", "💆"],
        "timeLimitSeconds": 90,
        "maxMistakes": 14,
        "revealText": "UG-MEM-10",
        "revealSubtitle": "10% off your cart — DM screenshot within 5 days.",
        "translations": {
            "sq": {
                "revealSubtitle": "10% zbritje për shportën — dërgo screenshot në DM brenda 5 ditëve."
            }
        },
    },
    "campaign": {
        "layoutTemplate": "product-focused",
        "fontPairId": "default",
        "accentColor": "#ec4899",
        "featuredSectionTitle": "Spring sale picks",
        "gamesSectionTitle": "Win a discount",
        "featuredGame": "TapHearts",
        "experiencesSlug": "urban-glow",
        "hero": {
            "headline": "Makeup that earns compliments.",
            "tagline": "Everyday makeup, viral skincare and limited drops — play once to unlock a DM-only offer.",
            "ctaLabel": "Play & order via DM",
            "ctaUrl": "https://instagram.com/urban.glow",
            "backgroundPattern": "dots",
        },
        "valueProposition": {
            "headline": "Authentic products, honest prices.",
            "body": "Urban Glow stocks trending K-beauty and European pharmacy favourites — clear ALL pricing, bundle deals and weekly flash sales on Instagram.",
        },
        "howToOrder": {
            "heading": "Order in 3 steps",
            "body": "1) Play a game and win your discount code. 2) DM us on Instagram with the code or a screenshot. 3) Pay on delivery anywhere in Albania.",
            "primaryCtaLabel": "DM to order",
            "primaryCtaUrl": "https://instagram.com/urban.glow",
        },
        "about": {
            "whatWeSell": "Lip gloss, serums, foundation, mascara, SPF and skincare sets.",
            "aboutUs": "Urban Glow is Tirana's Instagram-first beauty shop — trend-led picks, fast DM replies and nationwide delivery.",
            "city": "Tirana",
            "country": "Albania",
            "physicalAddress": "Online shop • Delivery across Albania",
            "ownerPhotoUrl": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=640&q=80",
        },
        "social": {
            "instagram": "https://instagram.com/urban.glow",
            "tiktok": "https://tiktok.com/@urban.glow",
            "email": "hello@urbanglow.example",
        },
        "featuredProducts": [
            {
                "id": "ug-1",
                "title": "Rose Quartz Hydrating Lip Gloss",
                "description": "Non-sticky shine · Spring sale",
                "price": "850 ALL (was 1,000)",
                "imageUrl": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",
                "ctaLabel": "Order via DM",
                "ctaUrl": "https://instagram.com/urban.glow",
            },
            {
                "id": "ug-2",
                "title": "Vitamin C Brightening Serum — 30 ml",
                "description": "Evens tone · 15% off with game code",
                "price": "1,200 ALL",
                "imageUrl": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80",
                "ctaLabel": "Order via DM",
                "ctaUrl": "https://instagram.com/urban.glow",
            },
            {
                "id": "ug-3",
                "title": "Soft Matte Foundation — 24h wear",
                "description": "12 shades · Free sponge with DM order",
                "price": "1,450 ALL",
                "imageUrl": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
                "ctaLabel": "Order via DM",
                "ctaUrl": "https://instagram.com/urban.glow",
            },
            {
                "id": "ug-4",
                "title": "Volume & Curl Mascara — Black",
                "description": "Smudge-proof · Bundle 2 for 1,700 ALL",
                "price": "950 ALL",
                "imageUrl": "https://images.unsplash.com/photo-1631214524020-7e268fd64a76?w=600&q=80",
                "ctaLabel": "Order via DM",
                "ctaUrl": "https://instagram.com/urban.glow",
            },
        ],
        "testimonials": [
            {
                "quote": "Ordered the lip gloss through DM after winning 15% off — arrived in two days and the shade is perfect.",
                "author": "Elira K.",
                "role": "Customer, Tirana",
            }
        ],
        "trustBadges": [
            {"label": "Nationwide delivery", "icon": "🚚"},
            {"label": "Pay on delivery", "icon": "💸"},
            {"label": "Original products", "icon": "✓"},
        ],
        "faq": [
            {
                "question": "How do I use my discount code?",
                "answer": "DM us on Instagram with your winning code or a screenshot of the result — we apply it before confirming your order.",
            },
            {
                "question": "Are the products original?",
                "answer": "Yes. We source from authorised EU distributors and list batch codes on request.",
            },
        ],
        "translations": {
            "sq": {
                "featuredSectionTitle": "Zgjedhjet e shitjes së pranverës",
                "gamesSectionTitle": "Fito zbritje",
                "hero": {
                    "headline": "Grim që të bën të dukesh e shkëlqyer.",
                    "tagline": "Grim për çdo ditë, skincare viral dhe drop-e të limituara — luaj një herë dhe zhblloko ofertën vetëm në DM.",
                    "ctaLabel": "Luaj dhe porosit në DM",
                },
                "valueProposition": {
                    "headline": "Produkte origjinale, çmime të qarta.",
                    "body": "Urban Glow sjell K-beauty trend dhe essentials nga farmaci evropiane — çmime në ALL, paketa me zbritje dhe flash sale çdo javë në Instagram.",
                },
                "howToOrder": {
                    "heading": "Porosit në 3 hapa",
                    "body": "1) Luaj dhe fito kodin e zbritjes. 2) Na shkruaj në Instagram me kodin ose screenshot. 3) Paguaj në dorëzim kudo në Shqipëri.",
                    "primaryCtaLabel": "Porosit në DM",
                },
                "about": {
                    "whatWeSell": "Shkelqyes buzësh, serum, fondotint, maskara, SPF dhe sete skincare.",
                    "aboutUs": "Urban Glow është dyqani yt i bukurisë në Instagram — produkte trend, përgjigje të shpejta në DM dhe dërgesa në gjithë vendin.",
                    "city": "Tiranë",
                    "country": "Shqipëri",
                    "physicalAddress": "Dyqan online • Dërgesa në gjithë Shqipërinë",
                },
                "featuredProducts": [
                    {
                        "title": "Shkelqyes buzësh hidratues Rose Quartz",
                        "description": "Shkëlqim pa ngjitje · Shitje pranverore",
                        "price": "850 ALL (ishte 1,000)",
                        "ctaLabel": "Porosit në DM",
                    },
                    {
                        "title": "Serum ndriçues Vitamin C — 30 ml",
                        "description": "Barazon tonin · 15% zbritje me kod loje",
                        "price": "1,200 ALL",
                        "ctaLabel": "Porosit në DM",
                    },
                    {
                        "title": "Fondotint Soft Matte — 24 orë",
                        "description": "12 nuanca · Sponxhë falas me porosi në DM",
                        "price": "1,450 ALL",
                        "ctaLabel": "Porosit në DM",
                    },
                    {
                        "title": "Maskara Volume & Curl — e zezë",
                        "description": "Rezistente ndaj smudgit · 2 copë për 1,700 ALL",
                        "price": "950 ALL",
                        "ctaLabel": "Porosit në DM",
                    },
                ],
                "testimonials": [
                    {
                        "quote": "Porosita shkelqyesin e buzëve në DM pas 15% zbritjes — erdhi për dy ditë dhe nuanca është perfekte.",
                        "author": "Elira K.",
                        "role": "Kliente, Tiranë",
                    }
                ],
                "trustBadges": [
                    {"label": "Dërgesa në gjithë Shqipërinë"},
                    {"label": "Pagesë në dorëzim"},
                    {"label": "Produkte origjinale"},
                ],
                "faq": [
                    {
                        "question": "Si e përdor kodin e zbritjes?",
                        "answer": "Na shkruaj në Instagram me kodin e fituar ose screenshot të rezultatit — e aplikojmë para konfirmimit të porosisë.",
                    },
                    {
                        "question": "A janë produktet origjinale?",
                        "answer": "Po. I marrim nga distributorë të autorizuar në BE dhe japim kod loti me kërkesë.",
                    },
                ],
            }
        },
    },
}

ROOT = Path(__file__).resolve().parents[1]
FILES = []  # Shop catalog is in ShopSeedRegistry.cs; update via scripts/generate-shop-seed.py

for path in FILES:
    data = json.loads(path.read_text(encoding="utf-8"))
    for i, shop in enumerate(data["shops"]):
        if shop.get("slug") == "urban-glow":
            data["shops"][i] = URBAN_GLOW
            break
    else:
        raise SystemExit(f"urban-glow not found in {path}")
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Updated {path}")
