// const pool = require('../db');
// const query = require('../queries/query');
const dotenv = require('dotenv');
const path = require('path')
const envPath = path.resolve(__dirname,'../.env');
// const openai = new OpenAIApi(new Configuration({
//     apiKey: process.env.CHATGPT_API_KEY
// }));
const handleGPTreq = require('../utils/GPTrequest');
dotenv.config({path:envPath});
// const { OpenAI } = require("langchain/llms/openai");
// const  { LLMChain } = require("langchain/chains");
// const  { PromptTemplate } = require("langchain/prompts");

// const llm = new OpenAI({
//     openAIApiKey:process.env.CHATGPT_API_KEY,
//   });

exports.add = async (req,res)=>{
    const name = req.body.name;
    const APP_URI = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(name)}&key=${process.env.GOOGLE_BOOKS_API}`;
    async function getImg(){
        return new Promise(async(resolve,reject)=>{
            const response = await axios.get(APP_URI);
            if(response){
                resolve(response.items[0].volumeInfo.imageLinks.thumbnail);
            }else{
                console.log(response);
                reject();
            }
        })
    } 
    async function getAuthor(){
        return new Promise(async(resolve,reject)=>{
            const response = await axios.get(APP_URI);
            if(response){
                resolve(response.items[0].volumeInfo.authors);//!here the authors is an array handle this
            }else{
                console.log(response);
                reject();
            }
        })
    }
    const book_image_link = await getImg();
    
    const book_name = name;

    const book_summary_query = `give me the summary of the book ${name} in 300 words`;
    const book_summary = handleGPTreq(book_summary_query);

    const all_tags = "Adventure,Fantasy,Inspirational,Self-Help,Biography,Psychology,Non-fiction,Spirituality,Business,Physics,Electrical Engineering,Computer Science";

    const author_name =getAuthor() //!make request to the google books api to get the author details;

    const key_takeaways_query = `give the top takeway for the book ${name} in less than 20 words`;//!optimixe this
    const key_takeaways = handleGPTreq(key_takeaways_query);

    const tagsPrompt = PromptTemplate.fromTemplate(`select the tags matching for the book {bookName} from ${all_tags}`);
    const tagsChain = new LLMChain({
        llm,
        tagsPrompt
    });
    const tags = await tagsChain.run(name);
    
    const data = {
        book_name:name,
        book_summary:book_summary,
        author_name:author_name,
        tags:tags,
        key_takeaways:key_takeaways,
        book_image_link:book_image_link
    };

}

exports.delete = (req,res)=>{
    //make a query operation to delete the data matching the name from the parameters
    //?easy
}
exports.update = (req,res)=>{
    //tkae the details from the body 
    //find the book for the given name and author name
    //update the data with new details
}