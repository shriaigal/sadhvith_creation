import { Link } from "react-router-dom";

export default function SectionHeading({ title, subtitle, linkTo, linkLabel }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="link-more">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
