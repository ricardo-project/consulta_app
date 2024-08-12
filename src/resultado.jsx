function Resultado(props) {
    const valor = (props.peso <= 0 || props.altura <= 0) ? "Valores inválidos" :
        props.peso/Math.pow(props.altura/100, 2)
    return (
        <div>
            <p>
                <b class="imc">IMC</b>: {valor}</p>
            {typeof valor == "number" ? (
                valor < 18.5 ? <b style={{color: "rgb(255,150,0)"}}>Magreza</b> : (
                    valor < 25 ? <b style={{color: "green"}}>Eutrofia</b> : (
                        valor < 30 ? <b style={{color: "rgb(255,150,0)"}}>Pré-obesidade</b> : (
                            valor < 35 ? <b style={{color: "red"}}>Obesidade moderada</b> : (
                                valor < 40 ?
                                    <b style={{color: "maroon"}}>Obesidade severa</b> :
                                    <b style={{color: "black"}}>Obesidade mórbida</b>
                            ))))
            ) : ""}
        </div>
    )
}

export default Resultado;