import { readFile } from 'fs/promises';
import ApiItau from './js/api_itau.js'

const config =  JSON.parse(await readFile('config/config.json', 'utf8'));
const apiItau = new ApiItau(config.URL, config.URLFrancesa, config.URLToken, config.ClientID, config.ClientSecret, config.certFile, config.keyFile, config.AgenciaConta)

apiItau.consultaBoletos()
