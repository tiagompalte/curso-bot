const env = require('../../.env')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const session = require('telegraf/session')
const bot = new Telegraf(env.token)

const botoes = lista => Extra.markup(
    Markup.inlineKeyboard(
        lista.map(item => Markup.callbackButton(item, `delete ${item}`)),
        {columns: 3}
    )
)

bot.use(session())

const verificarUsuario = (ctx, next) => {
    //caso tenha vindo de uma mensagem
    const mesmoIDMsg = ctx.update.message && ctx.update.message.from.id === env.userID
    //caso tenha vindo de uma callback
    const mesmoIDCallback = ctx.update.callback_query && ctx.update.callback_query.from.id === env.userID

    if(mesmoIDMsg || mesmoIDCallback) {
        next()
    }
    else {
        ctx.reply('Desculpe, não fui autorizado a conversar com você.')
    }
}

bot.start(verificarUsuario, async ctx => {
    const name = ctx.update.message.from.first_name
    await ctx.reply(`Seja bem vindo, ${name}!`)
    await ctx.reply('Escreva os itens que você deseja adicionar...')
    ctx.session.lista = []
})

bot.on('text', verificarUsuario, ctx => {
    let msg = ctx.update.message.text
    ctx.session.lista.push(msg)
    ctx.reply(`${msg} adicionado`, botoes(ctx.session.lista))
})

bot.action(/delete (.+)/, verificarUsuario, ctx => {
    ctx.session.lista = ctx.session.lista.filter(item => item !== ctx.match[1])
    ctx.reply(`${ctx.match[1]} deletado!`, botoes(ctx.session.lista))
})

bot.startPolling()