function Login(props) {
    let { authLogin } = props
    return <div className="login">
        <p className="login_title">Login</p>
        <div>
            <p>E-mail</p>
            <input type="text" className="info" />
        </div>
        <div>
            <p>Senha</p>
            <input type="password" className="info" />
        </div>
        <p style={{"textAlign": "center"}}>
            <input type="button" value="Entrar" onClick={() => authLogin()} />
            <input type="button" value="Limpar" />
        </p>
    </div>
}

export default Login