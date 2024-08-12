function Delete(props) {
    let { nome, info } = props
    let { sendForm, closeMenu, id, id_nome } = info
    return <div className="form_form">
              <p style={{"fontSize": "20px"}}>Deseja realmente excluir esta {nome}?</p>
              <hr></hr>
              <p style={{"fontWeight": "normal", "fontSize": "12px", "marginBottom": "10px"}}><b>{id_nome}</b>: {id}</p>
              <p className="p_delete">
                <i className="material-icons" onClick={() => sendForm()}>thumb_up</i>
                <i className="material-icons" onClick={() => closeMenu()}>thumb_down</i>
              </p>
            </div>
}

export default Delete