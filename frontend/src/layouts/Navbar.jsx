import { Link } from "react-router-dom"
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
        <Link to={`/processos`}>Gerenciamento Jurídico</Link>
        <ul>
            <li><Link to={`/processos`}>Home</Link></li>
            <li><Link to={`/processos/create`}
                className="new-btn">
                    Novo Processo
                </Link>
            </li>
        </ul>
    </nav>
  )
}

export default Navbar