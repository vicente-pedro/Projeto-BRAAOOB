export default function Logo({ size = 40 }) {
  return (
    <div className="logo" aria-label="Agendo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M8 36 L26 10"
          stroke="#3B9AE8"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path d="M20 12 L40 12 L30 34 Z" fill="#F5C518" />
        <circle cx="34" cy="34" r="7" fill="#E53935" />
      </svg>
      <span className="logo-text">gendo</span>
    </div>
  );
}
