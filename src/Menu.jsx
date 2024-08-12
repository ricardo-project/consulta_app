function Menu(props) {
    let { infoT, changeMenu, formList, menu_opt, login, logout } = props
    let { email, nome } = login
    return <div className="menu menu_open">
    <div className="menu_back"></div>
    <div className="menu_menu">
      <div className="menu_MENU">
        <div className="menu_user">
          <i className="material-icons" onClick={logout}>logout</i>
          <div>
            <p className="menu_nome">{nome}</p>
            <p className="menu_email">{email}</p>
          </div>
        </div>
        <div style={{"height": "100%", "display": "-webkit-box"}}>
          <div style={{"margin": "auto", "width": "calc(100% - 30px)"}}>
            {infoT.map((item, index) => (<div className={"menu_opt" + (index == 0 ? " menu_opt_s" : "")}>
              <div onClick={() => {
                let oldV = -Number(formList[0].style.marginTop.split("vh")[0])
                let newV = 100*index
                if(oldV != newV) {
                  menu_opt[oldV/100].classList.remove("menu_opt_s")
                  menu_opt[index].classList.add("menu_opt_s")
                  formList[0].style = "margin-top: -" + newV + "vh"
                  changeMenu(false)
                }
              }}>
                <i className="material-icons">{item.icon}</i>
                <p>{item.nome}</p>
              </div>
            </div>))}
          </div>
        </div>
      </div>
      <div className="menu_aba"><div className="aba" onClick={() => changeMenu(true)}>
        <div className="aba_seta"></div></div></div>
    </div>
  </div>
}
export default Menu