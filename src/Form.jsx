function Form(props) {

    let { VAL, infoT, form, classType, sendForm, limparCampo, changeFormFunc } = props.info
    return <div className="form_form">
        <h1>{infoT[form.i].nome}</h1>
        <hr></hr>
        {infoT[form.i].attr.map((item, index) => {
            let TYPE = item.type
            let oldV = form.value[index]
            return (
                <div className={"form_item " + classType[form.msg[index].type]}>
                  <p>{item.nome}</p>
                  <p className="form_p">
                    {TYPE == "select" ? <div className="select info">
                      {(typeof item.list == "number" ? VAL[item.list] : item.list).map((opt, ind) => {
                        let optV = item.value(opt)
                        return optV == oldV ?
                          <div className="option optSelect" onClick={() => changeFormFunc(index, null)}>
                            <p>{item.label(opt)}</p>
                            <p>{optV}</p>
                          </div> :
                          <div className="option" onClick={() => changeFormFunc(index, optV)}>
                            <p>{item.label(opt)}</p>
                            <p>{optV}</p>
                          </div>
                      })}
                    </div> :
                    (TYPE == "textarea" ? <textarea className="info" minLength={item.min} maxLength={item.max} onChange={() => changeFormFunc(index, null)} /> : (
                      TYPE == "text" ? <input type="text" className="info" minLength={item.min} maxLength={item.max} onChange={() => changeFormFunc(index, null)} disabled={item.attr == "cpf" && form.id != null} /> :
                      <input type={TYPE} className="info" onChange={() => changeFormFunc(index, null)} />
                    ))}
                    {(item.attr == "cpf" && form.id != null) ? "" : <i className="material-icons" onClick={() => limparCampo(index)}>cancel</i>}
                  </p>
                  <p className="form_msg">{form.msg[index].msg}</p>
                </div>
            )})}
        <p style={{"textAlign": "center"}}>
            {form.qtdE == 0 ? <input type="button" value={form.id == null ? "Enviar" : "Editar"} onClick={() => sendForm()}/> : ""}
            <input type="button" value="Limpar" />
        </p>
    {form.qtdE > 0 ? <p style={{"fontWeight": "normal", "fontSize": "11px"}}>O formulário NÃO poderá ser enviado pois há {form.qtdE == 1 ? "um campo obrigatório inválido" : (form.qtdE + " campos obrigatórios inválidos")}</p> : ""}
    </div>
}

export default Form