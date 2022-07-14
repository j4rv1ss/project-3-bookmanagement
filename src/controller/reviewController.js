const reviewModel=require("../models/reviewModel")
const bookModel=require("../models/bookModel")
const mongoose = require("mongoose");
const { findOne } = require("../models/bookModel");

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
        if(typeof data.review!=="string")return res.status(400).send({ status: false, message: "Please give reviews in String" })

//-----------------------------------------------------------------------------------//
        //Incrementing the reviews in book model
        const booksData=await bookModel.findByIdAndUpdate(bookId,
            {$inc:{reviews:1}},{new:true}).select({__v:0})     
        
        const reviewsData=await reviewModel.create(data)
        Object.assign(booksData._doc, { reviewsData: [reviewsData] });
        
        return res.status(201).send({status: true,message: 'Success',data:booksData});
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
};


const updateReviews=async function(req,res){
    try{
        const bookId=req.params.bookId
        if(!mongoose.isValidObjectId(bookId))return res.status(400).send({ status: false, message: "BookId is not valid" });

        const checkBook=await bookModel.findOne({_id:bookId,isDeleted:false})
        if(!checkBook)return res.status(404).send({ status: false, message: "Book Not Found" });

        const reviewId=req.params.reviewId
        if(!mongoose.isValidObjectId(reviewId))return res.status(400).send({ status: false, message: "ReviewId is not valid" });

        const checkReview=await reviewModel.findOne({_id:reviewId,isDeleted:false})
        if(!checkReview)return res.status(404).send({ status: false, message: "Review Not Found" });

        if(checkReview.bookId.toString() !== bookId)return res.status(400).send({ status: false, message: "Book id or reviewId is incorrect" });

        const data=req.body
        
        if(!isValidBody(data))return res.status(400).send({ status: false, message: "Please provide something to update " });    
        let {reviewedBy,rating,review}=data
        
        if(reviewedBy){
            if(!(/^[a-zA-Z\s]+$/).test(reviewedBy))return res.status(400).send({ status: false, message: "Please provide name in alphabets :)" });
        }
        if(rating){
            if(!(/^[12345]$/).test(rating))return res.status(400).send({ status: false, message: "Please give ratings between 1-5 " });
        }
        if(review){
            if(typeof review!=="string")return res.status(400).send({ status: false, message: "Please give review in correct format " });
        }
        let final ={reviewedBy,rating,review}    
        const reviewsData=await reviewModel.findOneAndUpdate({_id:reviewId},{$set:final},{new:true}).select({__v:0})
        const booksReview=checkBook.toObject()
        booksReview.reviewData=reviewsData
        return res.status(200).send({ status: true, message: "Success",data:booksReview });

    }catch(error){
        return res.status(500).send({ status: false, message: error.message});  }
};


const deleteReview=async function(req,res){
    try{
        const bookId=req.params.bookId
        if(!mongoose.isValidObjectId(bookId))return res.status(400).send({ status: false, message: "BookId is not valid" });

        const checkBook=await bookModel.findOne({_id:bookId,isDeleted:false})
        if(!checkBook)return res.status(404).send({ status: false, message: "Book Not Found" });

        const reviewId=req.params.reviewId
        if(!mongoose.isValidObjectId(reviewId))return res.status(400).send({ status: false, message: "ReviewId is not valid" });

        const checkReview=await reviewModel.findOne({_id:reviewId,isDeleted:false})
        if(!checkReview)return res.status(404).send({ status: false, message: "Review Not Found" });

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