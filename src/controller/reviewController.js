const reviewModel=require("../models/reviewModel")
const bookModel=require("../models/bookModel")
const mongoose = require("mongoose")

function isValid(value) {
    if (typeof value === "undefined" || typeof value === "null") return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  }
function isValidBody(body) {return Object.keys(body).length > 0}

const createReview=async function(req,res){
    try{
        const data=req.body
//-------------------------------VALIDATION START---------------------------------//
        if(!isValidBody(data))return res.status(400).send({ status: false, message: "Please provide Details" });
        const bookId=req.params.bookId
        data.bookId=bookId
        data.reviewedAt=new Date()

        if(!mongoose.isValidObjectId(bookId))return res.status(400).send({ status: false, message: "BookId is not valid" });
        const checkBook=await bookModel.findOne({_id:bookId,isDeleted:false})
        if(!checkBook)return res.status(404).send({ status: false, message: "Book Not Found or Already deleted" });
        //ratings
        if(!isValid(data.rating))return res.status(400).send({ status: false, message: "Ratings is required" });
        if(typeof data.rating!=="number")return res.status(400).send({ status: false, message: "Please give rating in number" });
        if(!(/^[12345]$/).test(data.rating))return res.status(400).send({ status: false, message: "Ratings between 1-5" });
        //reviews
        if(typeof data.review!=="string")return res.status(400).send({ status: false, message: "Please give reviews in String.....COOL" })
        //isDeleted
        if(data.isDeleted){
            if(data.isDeleted===true)return res.status(400).send({ status: false, message: "You can't delete while making a review!" })
            if(typeof data.isDeleted!=="boolean")return res.status(400).send({ status: false, message: "Please give isDeleted in Boolean type only" })}
//-----------------------------------------------------------------------------------//
        //Incrementing the reviews in book model
        const booksData=await bookModel.findByIdAndUpdate(bookId,
            {$inc:{reviews:1}},{new:true})      
        
        const reviewsData=await reviewModel.create(data)

        const booksReview=checkBook.toObject()
        booksReview.reviewData=reviewsData
        
        return res.status(201).send({status: true,message: 'Success',data:booksReview});
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
};


const updateReviews=async function(req,res){
    try{
        const data=req.body
        if((data.reviewedBy||data.rating||data.review)&&(Object.keys(data).length=3)){
            const bookId=req.params.bookId
            if(!mongoose.isValidObjectId(bookId))return res.status(400).send({ status: false, message: "BookId is not valid" });

            const checkBook=await bookModel.findOne({_id:bookId,isDeleted:false})
            if(!checkBook)return res.status(404).send({ status: false, message: "Book Not Found or Already deleted" });

            const reviewId=req.params.reviewId
            if(!mongoose.isValidObjectId(reviewId))return res.status(400).send({ status: false, message: "ReviewId is not valid" });

            const checkReview=await reviewModel.findOne({_id:reviewId,isDeleted:false})
            if(!checkReview)return res.status(404).send({ status: false, message: "Review Not Found or Already deleted" });

            if(checkReview.bookId.toString() !== bookId)return res.status(400).send({ status: false, message: "Book id or reviewId is incorrect" });
            

            
            const reviewsData=await reviewModel.findOneAndUpdate({_id:reviewId},{$set:data},{new:true})
            const booksReview=checkBook.toObject()
            booksReview.reviewData=reviewsData
            return res.status(200).send({ status: true, message: "Success",data:booksReview });
    }else{
   return res.status(400).send({ status: false, message: "You can't change requested fields" });

        }
    }catch(error){
        return res.status(500).send({ status: false, message: error.message});  }
};


const deleteReview=async function(req,res){
    try{
        const bookId=req.params.bookId
        if(!mongoose.isValidObjectId(bookId))return res.status(400).send({ status: false, message: "BookId is not valid" });

        const checkBook=await bookModel.findOne({_id:bookId,isDeleted:false})
        if(!checkBook)return res.status(404).send({ status: false, message: "Book Not Found or Already deleted" });

        const reviewId=req.params.reviewId
        if(!mongoose.isValidObjectId(reviewId))return res.status(400).send({ status: false, message: "ReviewId is not valid" });

        const checkReview=await reviewModel.findOne({_id:reviewId,isDeleted:false})
        if(!checkReview)return res.status(404).send({ status: false, message: "Review Not Found or Already deleted" });

        if(checkReview.bookId.toString() !== bookId)return res.status(400).send({ status: false, message: "Book id or reviewId is incorrect" });

        //Deccrementing the reviews in book model
        const decreaseReview=await bookModel.findByIdAndUpdate(bookId,{$inc:{reviews:-1}},{new:true})  

        const final = await reviewModel.findOneAndUpdate({_id: reviewId},{ isDeleted: true, deletedAt:new Date()},{ new: true })
        
        return res.status(200).send({ status: true, message: "Success", data: final });
    }catch(error){
        return res.status(500).send({ status: false, message: error.message });
    }
}
module.exports={deleteReview,updateReviews,createReview}