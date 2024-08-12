function Tabela(props) {
    let { attr, attrShow, lista, busca, Update, Delete, info } = props
    let { idAuto } = info
    return <div>
        <div className="attr_nome">
            {attrShow.map((item, index) => (
                <div style={{"flex": item.flex}}>{attr[item.ind].nome}</div>
            ))}
            <div style={{"width": "60px"}}></div>
        </div>
        {(busca.data == "" ? lista : lista.filter(l => l[busca.attr].toLowerCase().indexOf(busca.data) >= 0)).map((item, index) => {
            let id = idAuto ? item.id : item.cpf
            return <div className="attr_data">
                {attrShow.map((ITEM, index) => (
                    <div style={{"flex": ITEM.flex}}>{item[attr[ITEM.ind].attr]}</div>
                ))}
                <div style={{"width": "60px"}}>
                    <i className="material-icons" onClick={() => {
                        let value = (info.idAuto ? Object.values(item).slice(1) : Object.values(item))
                        Update({
                            id, value: {
                                value,
                                msg: new Array(value.length).fill().map(() => ({
                                    msg: "",
                                    type: 0
                                })),
                                qtdE: 0
                            }})
                    }}>edit</i>
                    <i className="material-icons" onClick={() => Delete(id)}>close</i>
                </div>
            </div>})}
    </div>
}

export default Tabela;