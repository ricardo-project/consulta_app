const pg = require("pg")
const WebSocket = require("ws")
const { randomInt } = require('crypto');

const config = {
    host: 'localhost',
    user: 'ricardo',
    database: 'consulta_9ysb',
    password: 'cmKxbwIdMx6VS0jKITl6F32Rn4hSMYhg',
    port: 5432
};
const postgres = new pg.Pool(config);
const server = new WebSocket.Server({ port: process.env.PORT || 80 })
let allS = []
let WS = (S, json) => S.send(JSON.stringify(json))
console.log("Iniciado servidor de WebSocket na porta 80!");

let infoT = {
    pessoa: {
        attr: ["rg", "nome", "data_nasc", "cidade_natal", "sexo", "casa"],
        id: "cpf"
    },
    casa: {
        attr: ["endereco", "telefone", "cidade"],
        id: "id"
    },
    consulta: {
        attr: ["data", "descricao", "casa", "pessoa"],
        id: "id"
    }
}
let userToken = {}

let insertItem = function(tabela, values, nome, S) {
    postgres.connect(function(err, client, done) {
        if(err) WS(S, {error: "Conexão com banco de dados falhou..."})
        else {
            let text = "insert into " + tabela + " values("
            for(let i = 1; i < values.length; i++) text += '$' + i + ", "
            text += "$" + values.length + ")"
            client.query({ text, values }, function(err, res) {
                done();
                if(err) WS(S, {error: "Erro ao <b>adicionar " + tabela + "</b> na tabela!"})
                else {
                    allS.forEach(e => e.send(JSON.stringify(e == S ? {action: "insert"} : {
                        action: "insert",
                        table: tabela, nome,
                        data: values
                    })))
                }
            });
    }})
}
let removeItem = function(tabela, id, nome, S) {
    postgres.connect(function(err, client, done) {
        if(err) WS(S, {error: "Conexão com banco de dados falhou..."})
        else {
            client.query({
                text: "delete from " + tabela + " where " + infoT[tabela].id + " = $1",
                values: [id] }, function(err, res) {
                done();
                if(err) WS(S, {error: "Erro ao <b>remover " + tabela + "</b> da tabela!"})
                else {
                    allS.forEach(e => e.send(JSON.stringify(e == S ? {action: "delete"} : {
                        action: "delete",
                        table: tabela,
                        nome, data: id
                    })))
                }
            });
        } 
    });
}
let updateItem = function(tabela, values, nome, S) {
    postgres.connect(function(err, client, done) {
        if(err) WS(S, {error: "Conexão com banco de dados falhou..."})
        else {
            var q = { text: "update " + tabela + " set ", values }
            let Attr = infoT[tabela].attr
            Attr.forEach((e, i) => q.text += e + " = $" + (i + 2) + (i == Attr.length - 1 ? " where " + infoT[tabela].id + " = $1" : ", "))
            client.query(q, function(err, res) {
                done();
                if(err) WS(S, {error: "Erro ao <b>atualizar " + tabela + "</b> na tabela!"})
                else allS.forEach(e => e.send(JSON.stringify(e == S ? {action: "update"} : {
                    action: "update",
                    table: tabela,
                    id: infoT[tabela].id, nome,
                    data: values
                })))
            });
       }       
    });
}
let getAllData = function(S, OBJ) {
    postgres.connect(function(err, client, done) {
        if(err) S.send(JSON.stringify({ error: "Conexão mal sucedida..."} ))
        else {
            Promise.all([
                client.query('select * from pessoa'),
                client.query('select * from casa'),
                client.query('select * from consulta')
            ]).then(function([pessoa, casa, consulta]) {
                casa.rows.forEach(e => e.id = Number(e.id))
                pessoa.rows.forEach(e => e.casa = (e.casa == null ? null : Number(e.casa)))
                consulta.rows.forEach(e => e.casa = Number(e.casa))

                S.send(JSON.stringify({
                    ...OBJ,
                    casa: casa.rows,
                    pessoa: pessoa.rows,
                    consulta: consulta.rows
                }))
            }, (error) => {throw error});
        }
    })
}
let autoLogin = function(OBJ, S) {
    let { email, token } = OBJ
    if(email in userToken) {
        let user = userToken[OBJ.email]
        let ind = user.token.indexOf(token)

        if(ind >= 0) buscarUsu([email, user.passwd], ind, "autologin", S)
        else WS(S, {autherror: "<b>Token não identificado</b> no login automático..."})
    } else WS(S, {autherror: "<b>E-mail não identificado</b> no login automático..."})
}
let buscarUsu = function(values, ind, action, S) {
    postgres.connect(function(err, client, done) {
        if(err) S.send(JSON.stringify({ error: "Conexão mal sucedida..."} ))
        else {
            client.query({ text: "select * from usuarios where email = $1 and senha = $2", values })
            .then(function(res) {
                let { rows } = res
                if(rows.length == 0) WS(S, {error: "<b>Login inválido</b>... Tente novamente!"})
                else {
                    let newToken = token()
                    let email = rows[0].email
                    if(email in userToken) {
                        if(ind == -1) userToken[email].token.push(newToken)
                        else userToken[email].token[ind] = newToken
                    } else userToken[email] = { passwd: rows[0].senha, token: [newToken] }
                    getAllData(S, {
                        action, email,
                        nome: rows[0].nome,
                        tipo: rows[0].tipo,
                        token: newToken
                    })
                }
            }, (error) => { throw error });
        }
    });
}

let abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
let token = function() {
    let N, S = ""
    for(let i = 0; i < 20; i++) {
        N = randomInt(0, 1)
        S += abc[randomInt(0, abc.length - 1)]
    } return S
}

server.on('connection', function(S) {
    allS.push(S)
    console.log("Entrou!")
    
    S.on("message", function(msg) {
        let OBJ = JSON.parse(msg)
        let funcS = null
        switch(OBJ.action) {
            case "autologin":
                autoLogin(OBJ, S)
                break
            case "login":
                let { email, senha } = OBJ
                buscarUsu([email, senha], -1, "login", S)
                break
            case "logout":
                if(OBJ.email in userToken) {
                    let uEmail = userToken[OBJ.email]
                    let ind = uEmail.token.indexOf(OBJ.token)
                    if(ind >= 0) {
                        uEmail.token.splice(ind, 1)
                        if(uEmail.token.length == 0) delete userToken[OBJ.email]
                        WS(S, { action: "logout", logout: true })
                    } else WS(S, { action: "logout", logout: false })
                } else WS(S, { action: "logout", logout: false })
                console.log(userToken)
                break
            case "insert": // Insere novo item na tabela
                funcS = insertItem
                break
            case "update":
                funcS = updateItem
                break
            case "delete": // Exclui item da tabela pelo identificador (id)
                funcS = removeItem
                break
        }
        if(funcS != null) {
            let { table, data, nome, token, email } = OBJ
            if(email in userToken) {
                if(userToken[email].token.indexOf(token) >= 0) funcS(table, data, nome, S)
                else WS(S, { error: "Token inserido inválido para usuário"})
            } else WS(S, { error: "Usuário inválido para alterar banco de dados" })
        }
    })

    S.on("close", function(msg) {
        allS.splice(allS.indexOf(S), 1);
        console.log("Saiu...")
    })
})
