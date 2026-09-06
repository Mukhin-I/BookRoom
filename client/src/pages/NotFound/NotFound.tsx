import './NotFound.css'
import home from '../../assets/home.svg'
import logo from '../../assets/logo-badge.svg'
import Header from '../../components/Header'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return(
    <>
      <Header />
      <div className="not-found-wrapper">
          <div className="not-found-content">
            <h1 className="err-code">404</h1>
            <h3 className="err-code-title">Страница не найдена</h3>
            <p className="err-code-desc">Запрашиваемая страница не существует, была удалена или перенесена на другой адрес.</p>

            <Link
              to={`/`}
              className="goback"
            >
              <img src={home} alt="home" />
              <p>Вернуться к переговорным</p>
            </Link>
          </div>
      </div>
    </>
  );
}