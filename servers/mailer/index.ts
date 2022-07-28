import nodemailer from "nodemailer"
import mg  from  "nodemailer-mailgun-transport"
import handlebars  from "handlebars"
import fs from 'fs'
import { mailSenderConfig } from "@servers/config"


const emailTemplateSource = fs.readFileSync(`${process.cwd()}/servers/template/application-resp.hbs`, "utf8")

interface ImailgunAuth {
    auth: {
        api_key: string | undefined;
        domain: string | undefined;
    };
}
const mailgunAuth = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY as string,
        domain: process.env.MAILGUN_DOMAIN as string
    }
} as ImailgunAuth

const template = handlebars.compile(emailTemplateSource)




async function wrappedSendMail(options:any){
    return new Promise((res, rej)=>{
        // @ts-ignore
        let transport = nodemailer.createTransport(mg(mailgunAuth))
        transport.sendMail(options, function (error, response) {
            if(error) return rej(error)

            return res(response)
        })
    })

}


export const registrationEmail = async(to:string, typeOfUser:string)=>{
    const sendApplicationResp = template({type:typeOfUser })
    const {from,emailSubject}  = mailSenderConfig
    const regMailOptions = {
        from,
        to,
        subject: emailSubject,
        html: sendApplicationResp
    }

    try{
        const response = await wrappedSendMail(regMailOptions)
        return {
            status:true,
            message:'Successfully sent email',
            data:response
        }

    }
    catch(e){
            return {
                status:false,
                error:e     
            }
    }
}

