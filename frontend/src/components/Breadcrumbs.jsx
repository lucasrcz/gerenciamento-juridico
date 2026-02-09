import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";

const breadcrumbMap = {
  "/dashboard": [{ label: "Dashboard", icon: "bi-speedometer2" }],

  // Processos
  "/processos": [{ label: "Processos", icon: "bi-folder" }],
  "/processos/create": [
    { label: "Processos", path: "/processos", icon: "bi-folder" },
    { label: "Cadastro" },
  ],
  "/processos/read": [
    { label: "Processos", path: "/processos", icon: "bi-folder" },
    { label: "Visualização" },
  ],
  "/processos/update": [
    { label: "Processos", path: "/processos", icon: "bi-folder" },
    { label: "Edição" },
  ],

  // Advogados
  "/advogados": [{ label: "Advogados", icon: "bi-briefcase" }],
  "/advogados/create": [
    { label: "Advogados", path: "/advogados", icon: "bi-briefcase" },
    { label: "Cadastro" },
  ],
  "/advogados/read": [
    { label: "Advogados", path: "/advogados", icon: "bi-briefcase" },
    { label: "Visualização" },
  ],
  "/advogados/update": [
    { label: "Advogados", path: "/advogados", icon: "bi-briefcase" },
    { label: "Edição" },
  ],

  // Partes
  "/partes": [{ label: "Partes", icon: "bi-people" }],
  "/partes/create": [
    { label: "Partes", path: "/partes", icon: "bi-people" },
    { label: "Cadastro" },
  ],
  "/partes/read": [
    { label: "Partes", path: "/partes", icon: "bi-people" },
    { label: "Visualização" },
  ],
  "/partes/update": [
    { label: "Partes", path: "/partes", icon: "bi-people" },
    { label: "Edição" },
  ],
};

function getBreadcrumbs(pathname) {
  if (breadcrumbMap[pathname]) {
    return breadcrumbMap[pathname];
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const basePath = `/${segments[0]}/${segments[1]}`;
    if (breadcrumbMap[basePath]) {
      return breadcrumbMap[basePath];
    }
  }

  return [{ label: "Dashboard", icon: "bi-speedometer2" }];
}

export default function Breadcrumbs() {
  const location = useLocation();
  const crumbs = getBreadcrumbs(location.pathname);

  return (
    <nav className="breadcrumb-container" aria-label="breadcrumb">
      <ol className="breadcrumb-list">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const isFirst = index === 0;
          
          return (
            <li
              key={index}
              className={`breadcrumb-item ${isLast ? "active" : ""}`}
            >
              {crumb.path && !isLast ? (
                <Link to={crumb.path} className="breadcrumb-link">
                  {isFirst && crumb.icon && (
                    <i className={`bi ${crumb.icon} me-2`}></i>
                  )}
                  {crumb.label}
                </Link>
              ) : (
                <span className="breadcrumb-text">
                  {isFirst && crumb.icon && (
                    <i className={`bi ${crumb.icon} me-2`}></i>
                  )}
                  {crumb.label}
                </span>
              )}
              {!isLast && (
                <span className="breadcrumb-separator">
                  <i className="bi bi-chevron-right"></i>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}