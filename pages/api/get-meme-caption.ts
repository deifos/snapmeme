import { Configuration, OpenAIApi } from "openai"

import { OpenAIStream } from "../../lib/OpenAIStream"

export const config = {
  runtime: "experimental-edge",
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const generateAction = async (req, res) => {
  const { imageDescription, context } = await req.json()

  let prompt: string

  if (context === "") {
    prompt = `You are a meme lord, master creator of memes using discriptions from photos you add sassy, funny, controversial captions, please generate a caption for the the photo with the following description ${imageDescription}, please do not add hashtags, just the caption`
  } else {
    prompt = `You are a meme lord, master creator of memes using discriptions from photos you add sassy, funny, controversial captions, please generate a caption for the the photo with the following description ${imageDescription} context is ${context}, please do not add hashtags, just the caption`
  }

  const payLoad = {
    // model: 'text-davinci-003',
    // prompt,
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.85, //temperature get a little more creative
    max_tokens: 300, //we can use this to calculate how much will cost us to generate stories based on openAPI prices here https://openai.com/api/pricing/
    stream: true,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    n: 1,
  }

  const stream = await OpenAIStream(payLoad)
  return new Response(stream)
}

export default generateAction
