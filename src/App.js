import logo from './logo.svg';
import { useState } from "react";
import useWebSocket from 'react-use-websocket';
import './App.css';
import Tabela from "./Tabela.jsx";
import Login from "./Login.jsx";
import Delete from "./Delete.jsx";
import Menu from "./Menu.jsx";
import Form from "./Form.jsx";

const WS_URL = 'ws://127.0.0.1:3001';
let infoT = [
  {
    nome: "Pessoas",
    icon: "people",
    tabela: "pessoa",
    idAuto: false,
    attr: [
      { attr: "cpf", nome: "CPF", type: "text",
        required: true, min: 11, max: 11},
      { attr: "rg", nome: "RG", type: "text",
        required: true, min: 10, max: 15},
      { attr: "nome", nome: "Nome completo", type: "text",
        required: true, min: 0, max: 100},
      { attr: "data_nasc", nome: "Data de nascimento", type: "date",
        required: true},
      { attr: "cidade_natal", nome: "Cidade natal", type: "text",
        required: true, min: 0, max: 100},
      { attr: "sexo", nome: "Sexo", type: "select",
        required: true, list: [
        { value: "M", sexo: "Masculino" },
        { value: "F", sexo: "Feminino" },
        { value: "O", sexo: "Outro" }
      ], value: (v) => { return v.value }, label: (v) => { return v.sexo }},
      { attr: "casa", nome: "Endereço da casa", type: "select",
        required: false, list: 1,
        value: (v) => { return v.id }, label: (v) => { return v.endereco }
      }
    ],
    attrShow: [{ ind: 0, flex: 1 }, { ind: 1, flex: 1 }, { ind: 2, flex: 2 }],
    infoIni: {
      value: ["", "", "", "", "", "", ""], // Vetor de valores
      msg: [
        { msg: "Campo está vazio", type: 1 },
        { msg: "Campo está vazio", type: 1 },
        { msg: "Campo está vazio", type: 1 },
        { msg: "Campo está vazio", type: 1 },
        { msg: "Campo está vazio", type: 1 },
        { msg: "Preencha o campo com uma das opções", type: 1 },
        { msg: "Valor não vai ser adicionado", type: 2 }
      ], // Vetor de mensagens
      qtdE: 6 // Quantidade de campos errados
    }
  }, {
    nome: "Casas",
    icon: "home",
    tabela: "casa",
    idAuto: true,
    attr: [
      { attr: "endereco", nome: "Endereço", type: "text", required: true },
      { attr: "telefone", nome: "Telefone", type: "text", required: false },
      { attr: "cidade", nome: "Cidade", type: "text", required: true }
    ],
    attrShow: [{ ind: 0, flex: 2 }, { ind: 2, flex: 4 }],
    infoIni: {
      value: ["", "", ""], // Vetor de valores
      msg: [
        { msg: "Campo está vazio", type: 1 },
        { msg: "Valor não vai ser adicionado", type: 2 },
        { msg: "Campo está vazio", type: 1 }
      ], // Vetor de mensagens
      qtdE: 2 // Quantidade de campos errados
    }
  }, {
    nome: "Consultas",
    icon: "edit",
    tabela: "consulta",
    idAuto: true,
    attr: [
      { attr: "data", nome: "Data/hora", type: "date", required: true },
      { attr: "descricao", nome: "Descrição da consulta", type: "textarea", required: true, min: 0, max: 300 },
      { attr: "casa", nome: "Endereço da casa", type: "select", required: true, list: 1,
        value: (v) => { return v.id }, label: (v) => { return v.endereco }},
      { attr: "pessoa", nome: "Pessoa", type: "select", list: 0, required: true,
        value: (v) => { return v.cpf }, label: (v) => { return v.nome }}
    ],
    attrShow: [{ ind: 0, flex: 1 }, { ind: 1, flex: 1 }],
    infoIni: {
      value: ["", "", "", ""], // Vetor de valores
      msg: [
        { msg: "Campo está vazio", type: 1 },
        { msg: "Campo está vazio", type: 1 },
        { msg: "Campo está vazio", type: 1 },
        { msg: "Campo está vazio", type: 1 }
      ], // Vetor de mensagens
      qtdE: 4 // Quantidade de campos errados
    }
  }
]
let classType = ["", "form_wrong", "form_atention"]
let campo = document.getElementsByClassName("info")
let idGerado

function App() {

  // type:
  //  + 0 (válido p/ qualq)
  //  + 1 (erro em campo obrigatório)
  //  + 2 (erro em campo opcional)

  const [pessoa, setPessoa] = useState([])
  const [buscaPessoa, setBuscaPessoa] = useState({ attr: "cpf", data: "", type: "text" })
  const [casa, setCasa] = useState({ attr: "nome", data: "" })
  const [buscaCasa, setBuscaCasa] = useState({ attr: "endereco", data: "", type: "text" })
  const [consulta, setConsulta] = useState([])
  const [buscaConsulta, setBuscaConsulta] = useState({ attr: "descricao", data: "", type: "text" })
  const [form, setForm] = useState({i: -1}) // i: Índice do formulário
  let [loading, setLoading] = useState(true)
  let [login, setLogin] = useState({telaLogin: -1})
  
  let VAL = [pessoa, casa, consulta]
  let buscaVAL = [buscaPessoa, buscaCasa, buscaConsulta]
  let setBuscaV = [setBuscaPessoa, setBuscaCasa, setBuscaConsulta]
  let changeForm = true
  let FORM = document.getElementsByClassName("form")
  let formList = document.getElementsByClassName("form_lists")
  let xICON = document.getElementsByClassName("x-icon")
  let message = document.getElementById("message")
  let menu = document.getElementsByClassName("menu")
  let menu_opt = document.getElementsByClassName("menu_opt")
  let buscaS = document.getElementsByClassName("busca_select")
  let buscaT = [
    document.getElementsByClassName("buscaTxt0"),
    document.getElementsByClassName("buscaTxt1"),
    document.getElementsByClassName("buscaTxt2")
  ]

  let showWelcomeMessage = (nome) => {
    let hour = new Date().getHours()
    if(hour < 6) showMessage("<b>Não está com sono, " + nome + "?</b>", "nightstay", "success")
    else if(hour < 12) showMessage("<b>Bom dia, " + nome + "!</b> Vai um café?", "coffee", "success")
    else if(hour < 14) showMessage("<b>Vamos almoçar, " + nome + "?</b>", "restaurant", "success")
    else if(hour < 18) showMessage("<b>Boa tarde, " + nome + "</b>... Vamos enfrentar esta tarde!", "sunny", "success")
    else showMessage("<b>Boa noite, " + nome + "</b>... Hora de descansar!", "bedtime", "success")
  }
  let openMenu = (newMenu, val, newDelete) => {
    setLoading(false)
    if(changeForm) {
      changeForm = false
      if(FORM.length > 0) {
        FORM[0].style = "transition: all 0.8s cubic-bezier(.4,.7,.6,1); left: 0"
        xICON[0].style = "right: 24px"
      }

      let OBJ = {
        i: newMenu,
        id: (val == null ? null : val.id),
        delete: newDelete,
        ...(newDelete == true ? {} : (val == null ? JSON.parse(JSON.stringify(infoT[newMenu].infoIni)) : val.value))
      }
      setForm(OBJ)
      if(val != null && "value" in val) {
        setTimeout(() => OBJ.value.forEach((e, i) => campo[i].value = OBJ.value[i], 200))
      }
    }
  }
  let limparCampo = (index) => {
    let OBJ = {
      i: form.i,
      id: form.id,
      value: form.value,
      msg: form.msg,
      type: form.type,
      qtdE: form.qtdE
    }

    let INI = infoT[form.i].infoIni
    let MSG = OBJ.msg[index]
    let newMSG = INI.msg[index]
    let oldType = MSG.type
    let attr = infoT[form.i].attr[index]

    campo[index].value = ""
    campo[index].focus()
    OBJ.value[index] = ""
    MSG.type = newMSG.type
    MSG.msg = newMSG.msg

    if(attr.required) {
      if(MSG.type == 0 && oldType != 0) OBJ.qtdE--
      else if(MSG.type != 0 && oldType == 0) OBJ.qtdE++
    }
    setForm(OBJ)
  }
  const closeMenu = () => {
    if(changeForm) {
      changeForm = false
      if(FORM.length > 0) {
        FORM[0].style = "transition: all 0.8s cubic-bezier(.4,0,.6,.4)"
        xICON[0].style = ""
      }
      setTimeout(() => changeForm = true, 800)
    }
  }
  let changeFormFunc = (index, value) => {
    let OBJ = {
      i: form.i,
      id: form.id,
      value: form.value,
      msg: form.msg,
      type: form.type,
      qtdE: form.qtdE
    }
    let attr = infoT[form.i].attr[index]

    OBJ.value[index] = (value == null ? campo[index].value : value)
    let MSG = OBJ.msg[index]

    let newType
    switch(attr.type) {
      case "text":
      case "textarea":

        let cmpr = OBJ.value[index].length
        if(cmpr == 0) {
          MSG.msg = (attr.required ? "Campo está vazio" : "Valor não vai ser adicionado")
          newType = (attr.required ? 1 : 2)
        } else if(cmpr < attr.min) {
          MSG.msg = "Campo NÃO está com qtd. mínima de dígitos (min. " + attr.min + ")"
          newType = (attr.required ? 1 : 2)
        } else if(cmpr > attr.max) {
          MSG.msg = "Campo excedeu máximo de dígitos permitido (max. " + attr.max + ")"
          newType = (attr.required ? 1 : 2)
        } else {
          MSG.msg = ""
          newType = 0
        }
        break

      case "select":
        let opt = OBJ.value[index]
        if(opt == "") {
          MSG.msg = (attr.required ? "Preencha o campo com uma das opções" : "Valor   não vai ser adicionado")
          newType = (attr.required ? 1 : 2)
        } else {
          MSG.msg = ""
          newType = 0
        }
        break

        case "date":
          let date = OBJ.value[index]
          if(date == 0) {
            MSG.msg = (attr.required ? "Insira uma data válida" : "Valor não vai ser adicionado")
            newType = (attr.required ? 1 : 2)
          } else {
            MSG.msg = ""
            newType = 0
          }
          break
    }
    if(attr.required) {
      if(newType == 0 && MSG.type != 0) OBJ.qtdE--
      else if(newType != 0 && MSG.type == 0) OBJ.qtdE++
    }
    MSG.type = newType
    setForm(OBJ)
  }
  let showMessage = function(msg, icon, type) {

    let newMessage = document.createElement("div")
    newMessage.className = "message_msg " + type
    newMessage.innerHTML = `
      <div class="message_reflexo"></div>
      <div class="message_div">
        <i class="material-icons">` + icon + `</i>
        <p style="margin: auto 0px">` + msg + `</p>
      </div>`

    let reflexo = newMessage.querySelector(".message_reflexo")
    message.appendChild(newMessage)
    
    setTimeout(function() {
      newMessage.style.left = 0
      newMessage.style.opacity = 1
      setTimeout(function() {
          reflexo.style.left = "calc(100% + 20px)"
          setTimeout(function() {
            newMessage.style = ""
            setTimeout(() => message.removeChild(newMessage), 800)
          }, 2700)
      }, 800)
    }, 50)
  }
  let changeSection = (n, obj) => {
    let transit = document.createElement("div")
    transit.className = "transit"
    message.appendChild(transit)

    setTimeout(function() {
      transit.style = "height: 100%; transition: all 1.1s cubic-bezier(.6,0,1,.4)"
      setTimeout(function() {
        setLogin({ telaLogin: n, ...obj })
        setTimeout(function() {
          transit.style = "bottom: 0; transition: all 1.1s cubic-bezier(0,.6,.6,1)"
          if(n == 0) setTimeout(() => showWelcomeMessage(obj.nome), 1200)
        }, 100)
      }, 1200)
    }, 50)
  }

  const { sendJsonMessage } = useWebSocket(WS_URL, {
    onOpen: (e) => {
      console.log('Conexão com WebSocket feita com sucesso!!')
      let local = JSON.parse(localStorage.getItem("user"))
      if(local == null) { // Não autenticado
        login.telaLogin = 1
      } else { // Autenticação automática
        console.log("Autenticação automática!!")
        sendJsonMessage({
          action: "autologin",
          email: local.email,
          token: local.token
        })
      }
    },
    onMessage: (e) => {
      let OBJ = JSON.parse(e.data)
      if("error" in OBJ) showMessage(OBJ.error, "error", "failed")
      else if("autherror" in OBJ) {
        showMessage(OBJ.autherror, "error", "failed")
        setLogin({ telaLogin: 1 })
      } else {
        if(OBJ.action == "autologin" || OBJ.action == "login") {
          let { pessoa, casa, consulta } = OBJ
          setPessoa(pessoa)
          setCasa(casa)
          setConsulta(consulta)
          localStorage.setItem("user", JSON.stringify({ email: OBJ.email, token: OBJ.token }))
        }

        switch(OBJ.action) {
          case "autologin":
            setLogin({ telaLogin: 0, nome: OBJ.nome, tipo: OBJ.tipo, email: OBJ.email, token: OBJ.token })
            showWelcomeMessage(OBJ.nome)
            break

          case "login":
            let { nome, tipo, email, token } = OBJ
            changeSection(0, { nome, tipo, email, token })
            break

          case "logout":
            let { logout } = OBJ
            if(logout) changeSection(1, {})
            break

          case "insert": // Inserir novo dado na tabela
          case "update": // Atualizar dado já inserido na tabela
            let add = (OBJ.action == "insert" ? true : false)
            let newO

            switch("table" in OBJ ? OBJ.table : infoT[form.i].tabela) {
              case "pessoa":
                if("data" in OBJ) {
                  let { data } = OBJ
                  newO = {
                    cpf: data[0],
                    rg: data[1],
                    nome: data[2],
                    data_nasc: data[3],
                    cidade_natal: data[4],
                    sexo: data[5],
                    casa: data[6]
                  }
                } else {
                  newO = {
                    cpf: (form.id == null ? form.value[0] : form.id),
                    rg: form.value[1],
                    nome: form.value[2],
                    data_nasc: form.value[3],
                    cidade_natal: form.value[4],
                    sexo: form.value[5],
                    casa: form.value[6]
                  }
                }

                if(add) setPessoa(pessoa.concat([newO]))
                else {
                  for(let i = 0; i < pessoa.length; i++) {
                    if(pessoa[i].cpf == newO.cpf) {
                      pessoa[i] = newO
                      break
                    }
                  } setPessoa(pessoa)
                }
                break
              case "casa":
                if("data" in OBJ) {
                  let { data } = OBJ
                  newO = {
                    id: data[0],
                    endereco: data[1],
                    telefone: data[2],
                    cidade: data[3]
                  }
                } else {
                  newO = {
                    id: (form.id == null ? idGerado : form.id),
                    endereco: form.value[0],
                    telefone: form.value[1],
                    cidade: form.value[2]
                  }
                }

                if(add) setCasa(casa.concat([newO]))
                else {
                  for(let i = 0; i < casa.length; i++) {
                    if(casa[i].id == newO.id) {
                      casa[i] = newO
                      break
                    }
                  } setCasa(casa)
                }
                break
              case "consulta":
                if("data" in OBJ) {
                  let { data } = OBJ
                  newO = {
                    id: data[0],
                    data: data[1],
                    descricao: data[2],
                    casa: data[3],
                    pessoa: data[4]
                  }
                } else {
                  newO = {
                    id: (form.id == null ? idGerado : form.id),
                    data: form.value[0],
                    descricao: form.value[1],
                    casa: form.value[2],
                    pessoa: form.value[3]
                  }
                }

                if(add) setConsulta(consulta.concat([newO]))
                else {
                  for(let i = 0; i < consulta.length; i++) {
                    if(consulta[i].id == newO.id) {
                      consulta[i] = newO
                      break
                    }
                  } setConsulta(consulta)
                }
                break
            }

            if("data" in OBJ) {
              let { table, nome } = OBJ
              showMessage("<b>" + nome + "</b> " + (OBJ.action == "insert" ? "adicionou uma nova" : "atualizou uma") + " " + table + "!", "check",  "success")
            } else {
              showMessage(infoT[form.i].nome.slice(0, -1) + " " + (OBJ.action == "insert" ? "adicionada" : "atualizada") + " com sucesso!", "check",  "success")
            }
            break

          case "delete": // Excluir dado na tabela pelo id

            let idO = ("data" in OBJ ? OBJ.data : form.id)
            switch("table" in OBJ ? OBJ.table : infoT[form.i].tabela) {
              case "pessoa":
                for(let i = 0; i < pessoa.length; i++) {
                  if(pessoa[i].cpf == idO) {
                    pessoa.splice(i, 1)
                    break
                  }
                } setPessoa(pessoa)
                break
              case "casa":
                for(let i = 0; i < casa.length; i++) {
                  if(casa[i].id == idO) {
                    casa.splice(i, 1)
                    break
                  }
                } setCasa(casa)
                break
              case "consulta":
                for(let i = 0; i < consulta.length; i++) {
                  if(consulta[i].id = idO) {
                    consulta.splice(i, 1)
                    break
                  }
                } setConsulta(consulta)
                break
            }

            if("data" in OBJ) {
              let { table, nome } = OBJ
              showMessage("<b>" + nome + "</b> excluiu uma " + table + "! <b>(Id: " + idO + ")</b>", "check",  "success")
            } else {
              showMessage(infoT[form.i].nome.slice(0, -1) + " excluída com sucesso!", "check",  "success")
            }
            break
        }
      }
      closeMenu()
    }
  });
  let changeMenu = (open) => {
    let listM = menu[0].classList
    if(listM.contains("menu_close")) {
      listM.remove("menu_close")
      listM.add("menu_transit")

      setTimeout(() => {
        listM.remove("menu_transit")
        listM.add("menu_open")
      }, 800)
    } else if(open) {
      listM.remove("menu_open")
      listM.add("menu_close")
    }
  }
  let changeBusca = (index) => {
    setBuscaV[index]({ ...JSON.parse(buscaS[index].value), data: "" })
  }
  let newBusca = (index) => {
    let { attr, type } = buscaVAL[index]
    setBuscaV[index]({ data: buscaT[index][0].value.trim().toLowerCase(), attr, type })
  }
  let sendForm = () => {
    let info = infoT[form.i]
    setLoading(true)

    sendJsonMessage({
      action: (form.delete ? "delete" : (form.id == null ? "insert" : "update")),
      table: info.tabela,
      nome: login.nome,
      email: login.email,
      token: login.token,
      data: (form.delete ? form.id : (info.idAuto ? [(form.id == null ? (idGerado = new Date().getTime()) : form.id)].concat(form.value) : form.value)),
      ...(form.delete ? { id: info.idAuto ? "id" : "cpf" } : {})
    })
  }
  let authLogin = function() {
    FORM[0].style = "left: 0"
    setLoading(true)
    sendJsonMessage({
      action: "login",
      email: campo[0].value,
      senha: campo[1].value
    })
  }
  let logout = function() {
    FORM[0].style = "left: 0"
    setLoading(true)
    sendJsonMessage({
      action: "logout",
      email: login.email,
      token: login.token
    })
  }
  return (
    <div className="App" style={{"display": login.telaLogin == 0 ? "" : "-webkit-box"}}>

      <div id="message"></div>
      <div className="form">
        <span className="material-icons x-icon" onClick={closeMenu}>close</span>
        {loading ? <div className="loader"></div> :
        (form.i >= 0 ? <div className="form_FORM">
          {form.delete ?
            <Delete nome={infoT[form.i].nome.toLowerCase().slice(0, -1)} info={{sendForm,   closeMenu, id: form.id, id_nome: (infoT[form.i].idAuto ? "id" : "CPF")}}></Delete> :
            <Form info={{ VAL, infoT, form, classType, sendForm, limparCampo, changeFormFunc }}></Form>}
        </div> : "")}
      </div>

      {login.telaLogin == 0 ? <Menu infoT={infoT} changeMenu={changeMenu} formList={formList} menu_opt={menu_opt} login={login} logout={logout}></Menu> : ""}
      {login.telaLogin == 0 ? <div style={{"height": "100%", "width": "calc(100% - 85px)", "overflow": "hidden"}}>
          <div className="form_lists">
          {infoT.map((item, index) => {
          let typeB = buscaVAL[index].type
          return <div className="form_list">
            <div className="title">
              <div style={{"display": "-webkit-box"}}>
                <div style={{"margin": "auto", "display": "flex", "alignItems": "center"}}>
                  <i className="material-icons icon">{item.icon}</i>
                  <h1>{item.nome}</h1>
                </div>
                <div style={{"margin": "auto 0px"}}>
                  <i className="material-icons add" onClick={() => openMenu(index, null, false)}  >add_circle</i>
                </div>
              </div>
              <div>
                <select className="busca_select" style={{"width": "200px"}} onChange={() => changeBusca(index)}>
                  {item.attr.map((ITEM, ind) => <option value={'{"attr": "' + ITEM.attr + '", "type": "' + ITEM.type + '"}'}>{ITEM.nome}</option>)}
                </select>
                {typeB == "text" || typeB == "select" ? <input type="text" className={"buscaTxt" + index} onInput={() => newBusca(index)} /> : <p>
                  <input type="date" className={"buscaTxt" + index} style={{"width": "150px"}}/>
                  <input type="date" className={"buscaTxt" + index} style={{"width": "150px"}}/>
                </p>}
              </div>
            </div>
            <Tabela info={infoT[index]} lista={VAL[index]} attr={item.attr} attrShow={item.attrShow} busca={buscaVAL[index]} Update={(edit) => {
              openMenu(index, edit, false)}} Delete={(id) => openMenu(index, {id}, true)}></Tabela>
          </div>})}</div>
        </div> :

        (login.telaLogin == 1 ? <div style={{"margin": "auto"}}>
          <Login authLogin={authLogin}></Login>
      </div> : "")}

    </div>);
}

export default App;