/**
 * Revisa que kuyenclimbing.cl esté bien apuntado a GitHub Pages.
 *
 *   node tools/verificar-dominio.mjs
 *   node tools/verificar-dominio.mjs otrodominio.cl
 *
 * Comprueba, en este orden: que el dominio esté inscrito en NIC Chile, a qué
 * servidores de nombre está delegado, que los registros A sean los cuatro de
 * GitHub Pages, que el www redirija al dominio desnudo, que el sitio responda
 * por HTTPS con un certificado válido y que sirva lo que este repo publica.
 *
 * Sirve para saber en qué paso está la configuración mientras el DNS propaga,
 * que puede tardar hasta 24 horas.
 */
import { Resolver } from 'node:dns/promises'
import { connect } from 'node:net'
import * as http from 'node:http'
import * as https from 'node:https'
import { SITES } from '../src/site.config.mjs'

const dominio = process.argv[2] || SITES.cl.cname

/** Los cuatro que GitHub documenta para un dominio desnudo (apex). */
const GITHUB_A = ['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153']
const GITHUB_AAAA = ['2606:50c0:8000::153', '2606:50c0:8001::153', '2606:50c0:8002::153', '2606:50c0:8003::153']

const resultados = []
const paso = (nombre, ok, detalle = '') => {
  resultados.push([nombre, ok])
  console.log(`${ok ? 'OK   ' : 'FALTA'} ${nombre}${detalle ? ` ${detalle}` : ''}`)
}

/** Consulta el whois de NIC Chile, que es quien sabe si el dominio existe. */
function whois(nombre) {
  return new Promise((resolve) => {
    const socket = connect({ host: 'whois.nic.cl', port: 43, timeout: 12000 })
    let texto = ''
    socket.on('connect', () => socket.write(`${nombre}\r\n`))
    socket.on('data', (trozo) => { texto += trozo })
    socket.on('end', () => resolve(texto))
    socket.on('timeout', () => { socket.destroy(); resolve('') })
    socket.on('error', () => resolve(''))
  })
}

// Se usa un resolutor público y no el del sistema: el del sistema cachea las
// respuestas negativas y sigue diciendo que el dominio no existe un buen rato
// después de que ya existe.
const dns = new Resolver()
dns.setServers(['1.1.1.1', '8.8.8.8'])

const texto = await whois(dominio)
const inscrito = texto !== '' && !/no entries found/i.test(texto)
const creado = (texto.match(/Creation date:\s*(.+)/) || [])[1]
paso(`${dominio} está inscrito en NIC Chile`, inscrito, creado ? `creado el ${creado.trim()}` : '')

if (inscrito) {
  const servidores = [...texto.matchAll(/Name server:\s*(\S+)/g)].map((m) => m[1])
  paso('el dominio tiene servidores de nombre declarados', servidores.length >= 2, servidores.join(', '))
}

const registros = async (tipo) => {
  try {
    return tipo === 'A' ? await dns.resolve4(dominio) : await dns.resolve6(dominio)
  } catch {
    return []
  }
}

const a = await registros('A')
const faltantes = GITHUB_A.filter((ip) => !a.includes(ip))
const sobrantes = a.filter((ip) => !GITHUB_A.includes(ip))
paso('los cuatro registros A apuntan a GitHub Pages', a.length > 0 && faltantes.length === 0 && sobrantes.length === 0,
  a.length === 0 ? 'todavía no resuelve' : `hay ${a.join(', ')}${faltantes.length ? ` | faltan ${faltantes.join(', ')}` : ''}${sobrantes.length ? ` | sobran ${sobrantes.join(', ')}` : ''}`)

const aaaa = await registros('AAAA')
if (aaaa.length) {
  const malos = aaaa.filter((ip) => !GITHUB_AAAA.includes(ip.toLowerCase()))
  paso('los registros AAAA son los de GitHub Pages', malos.length === 0, malos.join(', '))
}

let www = []
try { www = await dns.resolveCname(`www.${dominio}`) } catch {}
paso(`www.${dominio} apunta a GitHub`, www.some((v) => /github\.io$/i.test(v)), www.join(', ') || 'sin registro CNAME')

/**
 * Un GET que no sigue la redirección, para ver el estado real y el Location.
 *
 * No se usa fetch: con redirect 'manual' igual devuelve 200 y el Location en
 * null, así que un 301 bien puesto se ve como si no existiera.
 */
function pedir(url) {
  return new Promise((resolve) => {
    const { request } = url.startsWith('https:') ? https : http
    const req = request(url, { method: 'GET', timeout: 20000 }, (res) => {
      let cuerpo = ''
      res.on('data', (t) => { cuerpo += t })
      res.on('end', () => resolve({
        estado: res.statusCode,
        destino: res.headers.location || '',
        servidor: res.headers.server || '',
        cuerpo,
      }))
    })
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }) })
    req.on('error', (e) => resolve({ error: String(e.code || e.message) }))
    req.end()
  })
}

const seguro = await pedir(`https://${dominio}/`)
paso('responde por HTTPS con certificado válido', seguro.estado >= 200 && seguro.estado < 400,
  seguro.error ? seguro.error : `${seguro.estado}${seguro.servidor ? ` (${seguro.servidor})` : ''}`)

if (!seguro.error) {
  const html = seguro.cuerpo || ''
  paso('sirve el sitio de Kuyen', html.includes('Kuyen'), html ? `${html.length} bytes` : 'sin cuerpo')
  paso('no se indexa mientras sean tres propuestas',
    /<meta name="robots" content="noindex/.test(html) || SITES.cl.sitemap,
    SITES.cl.sitemap ? 'el template ya está elegido, se indexa a propósito' : '')
}

const wwwResp = await pedir(`https://www.${dominio}/`)
if (!wwwResp.error) {
  paso('el www redirige al dominio desnudo', wwwResp.estado >= 300 && wwwResp.estado < 400, wwwResp.destino)
}

const claro = await pedir(`http://${dominio}/`)
if (!claro.error) paso('el http redirige a https', /^https:/.test(claro.destino), `${claro.estado} ${claro.destino}`)

const faltan = resultados.filter(([, ok]) => !ok)
console.log(`\n${resultados.length - faltan.length}/${resultados.length} comprobaciones OK`)
if (faltan.length) console.log('El DNS puede tardar hasta 24 horas en propagar. Volvé a correr esto más tarde.')
process.exit(faltan.length ? 1 : 0)
