import axios from 'axios';
import fs from 'fs';
import https from 'https';

export default class ApiItau {
    constructor(URL, URLFrancesa, URLToken, clientId, clientSecret, certFile, keyFile, agenciaConta){
        this.URL = URL
        this.URLFrancesa = URLFrancesa
        this.URLToken = URLToken
        this.clientId = clientId
        this.clientSecret = clientSecret
        this.certFile = certFile
        this.keyFile = keyFile
        this.agenciaConta = agenciaConta
        this.accessToken = ''
    }

    consultaBoletos(){
        // Le o conteudo dos certificados para anexar a requisição
        this.certFile = fs.readFileSync(this.certFile);
        this.keyFile = fs.readFileSync(this.keyFile);

        // Configurar o agente HTTPS com certificado e chave
        const agent = new https.Agent({ 
            cert: this.certFile, 
            key: this.keyFile, 
            rejectUnauthorized: true // Define como `true` se o servidor requer autenticação
        });

        // Dados a serem enviados no corpo da requisição
        const data = {
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret : this.clientSecret
        };

        // Configurações da requisição
        const axiosConfig = {
            method: 'post',
            url: this.URLToken,
            httpsAgent: agent, // Usar o agente HTTPS configurado com certificado e chave
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
                'Host': 'sts.itau.com.br',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'            
            },
            data: data
        };

        // Fazer a requisição usando Axios
        axios(axiosConfig)
        .then(response => {
            this.accessToken = response.data.access_token;
            
            this.consultaDataMovimentacao()        
        })
        .catch(error => {
            //console.log(error)
            // escrever em arquivo um erro
        });
    }

    
    
    consultaDataMovimentacao(){
        // pegar de um arquivo que o pce vai escrever e trazer para esta variavel
        const dataMovimentacao = '2024-06-30'
        
        // Configurar o agente HTTPS com certificado e chave
        const agent = new https.Agent({ 
            cert: this.certFile, 
            key: this.keyFile, 
            rejectUnauthorized: true // Define como `true` se o servidor requer autenticação
        });
        
        // Configurações da requisição
        const axiosConfig = {
            url: this.URLFrancesa + "/" + this.agenciaConta + "/movimentacoes/?data=" + dataMovimentacao + "&tipo_cobranca=boleto",
            httpsAgent: agent, // Usar o agente HTTPS configurado com certificado e chave
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'x-itau-apikey': this.clientId,
                'x-itau-correlationID': this.#gerarGuid(),
                'x-itau-flowID': '1',
                'Host': 'boletos.cloud.itau.com.br',
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'            
            },
        };
        
        // Fazer a requisição usando Axios
        axios(axiosConfig)
        .then(response => {
            //console.log(response.data)        
            console.log(response.response.data)        
        })
        .catch(error => {
            console.log(error.response.data)
        });
    }



    #gerarGuid(){        
        return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, this.#randomDigit());
    }

    #randomDigit() {    
        return ((Math.random() * 16) | 0).toString(16);
    }
        
}