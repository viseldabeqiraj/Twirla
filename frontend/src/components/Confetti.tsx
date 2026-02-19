import './Confetti.css';

interface ConfettiProps {
  count?: number;
}

export default function Confetti({ count = 50 }: ConfettiProps) {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
  
  return (
    <div className="confetti-container">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="confetti" 
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)]
          }}
        />
      ))}
    </div>
  );
}

