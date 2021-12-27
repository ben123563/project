const express = require('express')
const router = express.Router()
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var ObjectId = require('mongodb').ObjectId; 
//const date = require('date')

router.get('/', (req, res) =>{
    const {price} = req.query
    const {name, id, arrivalDate, returnDate, nameHotel, adults, children} = req.body
    const arrival = (arrivalDate.split(".")).map(Number) 
    const return1 = (returnDate.split(".")).map(Number) 
    
    var hotels = {}
    const Day = new Date()
    var date1 = new Date(`${arrival[1]}.${arrival[0]}.${arrival[2]}`)
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("data");
        dbo.collection("hotels").find({}).toArray(function(err, result) {
            if (err) throw err;
            hotels = result
            const hotel = hotels.find((hotel)=> hotel.name === nameHotel)
            const monthArr  = getMonth(arrival[1],hotel)
            const monthRet = getMonth(return1[1],hotel)
            if(date1.getTime() < Day.getTime()){
                return res.status(200).json({success:true, data: "Your arrival Date has already passed" })
            }             
            let [price1, count1, count2] = checkCompo(hotel,monthArr, monthRet, arrival,return1,adults,children)      
            if ((count1 == 0 & count2 == 0 & price1 <= Number(price)) || (count2 == 0 & count1 == 0 & typeof(price) == 'undefined')){
                console.log(`${name}'s order, with id: ${id}, is awaiting approval in ${nameHotel} Hotel `)
                res.status(200).json({success:true, data: {"Name Hotel": nameHotel, "Arrival Date":arrivalDate, "Return Date": returnDate, "Adults": adults, "Children": children, "Price": price1} })
                router.get('/approval', (req, res) =>{
                    const {pending} = req.query
                    if( pending == 'true'){
                        if( arrival[1] == return1[1] && arrival[0] < return1[0]){
                            for (let i =arrival[0]; i<return1[0]; i++){
                                monthArr[i]++
                            }
                            getUpdate(arrival[1], hotel, monthArr)
                        }
                        else{
                            for (let i =arrival[0]; i<monthArr.length; i++){
                                monthArr[i]++  
                                console.log(monthArr)
                            }
                            getUpdate(arrival[1], hotel, monthArr)
                            for (let i = 1; i<return1[0]; i++){
                                monthRet[i]++}
                            getUpdate(return1[1], hotel, monthRet)   
                        }
                        dbo.collection(nameHotel).insertOne({name: `${name}`, id: `${id}`, Hotel: `${nameHotel}` , arivalDate: `${arrivalDate}` , returnDate: `${returnDate}` });
                        dbo.collection(nameHotel).find({"id": `${id}`}).toArray(function(err, result) {
                            console.log(`${name}'s order, with id: ${id}, has been placed in ${nameHotel} Hotel `)
                            return res.status(200).json({success:true, data: {"Number Order": result[0]._id, "Name": nameHotel, "Arrival Date":arrivalDate, "Return Date": returnDate, "Adults": adults, "Children": children, "Price": price1} })
                        })
                    }
                    else{
                        return res.status(200).json({success:true, data: "Your order has not been confirmed" })
                    }
                })
            }
            else{
                let counter = 0
                const arr = []
                for (let i = 0; i<hotels.length; i++){
                    for(let j = arrival[0]; j<return1[0]; j++){
                        if (hotels[i].days[j-1] >= hotels[i].limit){
                            counter = -1
                        }
                    }
                    if (counter == 0){
                        [price1, count1, count2] = checkCompo(hotel,monthArr, monthRet, arrival,return1,adults,children)
                        if (price1 <= Number(price)){
                            arr.push({ name : hotels[i].name, ArrivalDate: arrivalDate, ReturnDate: returnDate, price: price1})
                        } 
                    }
                    counter = 0
                }
                if (arr.length == 0){
                    db.close();
                    return res.status(404).json({success:true, msg: "These hotels are not available on these dates" })
                }
                else{
                    res.status(200).json({success:true,  msg: "we are sorry but we did not find any suitable dates in this hotel, but we found in other hotels" ,data: arr})
                    console.log(`Other options have been sent to ${name}, id: ${id}`)
                    router.get('/approval', (req, res) =>{
                        const {pending, nameHotelP} = req.query
                        const hotel = arr.find((hotel)=> hotel.name === nameHotelP)
                        if( pending == 'true'){
                            if( arrival[1] == return1[1] && arrival[0] < return1[0]){
                                for (let i =arrival[0]; i<return1[0]; i++){
                                    monthArr[i]++
                                }
                                getUpdate(arrival[1], hotel, monthArr)
                            }
                            else{
                                for (let i =arrival[0]; i<monthArr.length; i++){
                                    monthArr[i]++
                                    getUpdate(arrival[1], hotel, monthArr)
                                }
                                for (let i = 1; i<return1[0]; i++){
                                    monthRet[i]++
                                    getUpdate(return1[1], hotel, monthRet)   
                                }
                            }
                            dbo.collection(hotel.name).insertOne({name: `${name}`, id: `${id}`, Hotel: `${hotel.name}` , arivalDate: `${arrivalDate}` , returnDate: `${returnDate}`, adults: `${adults}`, children: `${children}`, price: hotel.price });
                            dbo.collection(hotel.name).find({"id": `${id}`}).toArray(function(err, result) {
                                return res.status(200).json({success:true, data: {"Number Order": result[0]._id, "Name":name, "Id": id ,"Hotel Name": hotel.name, "Arrival Date":arrivalDate, "Return Date": returnDate,  adults: adults, children: children, "Price": hotel.price} })
                            })
                        }
                        else{
                            return res.status(200).json({success:true, data: "Your order has not been confirmed" })
                        }
                    })
                }    
            }        
        })
    })
})

router.get('/all', (req, res) =>{
    const {price} = req.query
    const {name, id, arrivalDate, returnDate, adults, children} = req.body
    const arrival = (arrivalDate.split(".")).map(Number) 
    const return1 = (returnDate.split(".")).map(Number) 
    let price1 = 0
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("data");
        dbo.collection("hotels").find({}).toArray(function(err, result) {        
            let counter = 0
            const arr = []
            for (let i = 0; i<result.length; i++){
                for(let j = arrival[0]; j<return1[0]; j++){
                    if (result[i].days[j-1] >= result[i].limit){
                        counter = -1
                    }
                }
                if (counter == 0){
                    if((adults<result[i].adultsLimit && adults+children<= result[i].peopleLimit) || (adults == result[i].adultsLimit & children == 0) ){       
                        price1 = (result[i].price*adults/2+children*result[i].addPriceChild)*(return1[0]-arrival[0])
                        if(adults==0){
                            if(price1<result[i].price*(return1[0]-arrival[0])/1.5){
                                price1=result[i].price*((return1[0]-arrival[0])/1.5)
                            }
                        }
                        if(adults==1 & children == 0){  
                            price1=hotel.price*((return1[0]-arrival[0]))
                        }
                        if ( typeof(price) == 'undefined' || Number(price) >= price1){
                            arr.push({"name": result[i].name, "Arrival Date": arrivalDate, "Return Date": returnDate, adults: adults, children: children, "price": price1})
                        }
                    }
                }
                counter = 0
            }
            if (arr.length == 0){
                return res.status(404).json({success:true, msg: "These hotels are not available on these dates" })
            }
            else{
                res.status(200).json({success:true, msg: "These hotels are available on these dates" ,data: arr})
                router.get('/all/approval', (req, res) =>{
                    const {pending, nameHotelP} = req.query
                    const hotel = arr.find((hotel)=> hotel.name === nameHotelP)
                    if( pending == 'true'){
                        for (let i =arrival[0]-1; i<return1[0]-1; i++){
                            dbo.collection("hotels").updateMany( {name : hotel.name} , {$inc: {"days.1": 1}} )
                        }
                        dbo.collection(hotel.name).insertOne({name: `${name}`, id: `${id}`, Hotel: `${hotel.name}` , arivalDate: `${arrivalDate}` , returnDate: `${returnDate}`, adults: adults, children: children, price: hotel.price });
                        dbo.collection(hotel.name).find({"id": `${id}`}).toArray(function(err, result) {
                            return res.status(200).json({success:true, data: {"Number Order": result[0]._id, "Name":name, "Id": id ,"Hotel Name": hotel.name, "Arival Date":arrivalDate, "Return Date": returnDate, adults: adults, children: children, "Price": hotel.price} })
                        })
                    }
                })
            }
        })
    })
})

router.delete('/delete', (req, res) =>{
    const {numberOrder, nameHotel} = req.body
    console.log(numberOrder, nameHotel)
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("data");
        dbo.collection(nameHotel).find( { _id : ObjectId(`${numberOrder}`)} ).toArray(function(err,result){
            if (result ==''){
                return res.status(200).json({success:true, msg: "We are sorry but we didn't succeed to cancel your order, contant us" })
            }
            else{
                dbo.collection(nameHotel).deleteOne( { _id : ObjectId(`${numberOrder}`)} )
                return res.status(200).json({success:true, msg: "Your order has been canceled" })
            }
        })
    })   
})
         
module.exports = router

const getMonth = (number,hotel) => {
    switch (number){
        case 1:
            return hotel.days.jan
            break
        case 2:
            return hotel.days.feb
            break
        case 3:
            return hotel.days.mar
            break
        case 4:
            return hotel.days.apr
            break
        case 5:
            return hotel.days.may
            break
        case 6:
            return hotel.days.juny
            break
        case 7:
            return hotel.days.july
            break
        case 8:
            return hotel.days.aug
            break
        case 12:
            return hotel.days.dec
            break    
    }
}
const getUpdate = (number,hotel,monthArr) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("data");
        dbo.collection("hotels").find({}).toArray(function(err, result) {
            switch(number){
                case 1:
                    dbo.collection("hotels").updateOne( {name : hotel.name} , {$set: {"days.jan": monthArr}} )
                    break
                case 2:
                    dbo.collection("hotels").updateOne( {name : hotel.name} , {$set: {"days.feb": monthArr}} )
                    break
                case 3:
                    dbo.collection("hotels").updateOne( {name : hotel.name} , {$set: {"days.mar": monthArr}} )
                    break
                case 4:
                    dbo.collection("hotels").updateOne( {name : hotel.name} , {$set: {"days.apr": monthArr}} )
                    break
                case 5:
                    dbo.collection("hotels").updateOne( {name : hotel.name} , {$set: {"days.may": monthArr}} )
                    break
                case 6:
                    dbo.collection("hotels").updateOne( {name : hotel.name} , {$set: {"days.juny": monthArr}} )
                    break
                case 7:
                    dbo.collection("hotels").updateOne( {name : hotel.name} , {$set: {"days.july": monthArr}} )
                    break
                case 8:
                dbo.collection("hotels").updateOne( {name : hotel.name} , {$set: {"days.aug": monthArr}} )
                case 12:
                    dbo.collection("hotels").updateOne( {name : hotel.name} , {$set: {"days.dec": monthArr}} )
                    break
            }
        })
    })
}
const checkCompo = (hotel,monthArr, monthRet, arrival,return1,adults,children)=> {
    let count1=  0
    let count2 = 0
    let price1 = 0
    if( arrival[1] == return1[1] && arrival[0] < return1[0]){           
        price1 = (hotel.price*adults/2+children*hotel.addPriceChild)*(return1[0]-arrival[0])
        if(adults==0){
            if(price1<hotel.price*(return1[0]-arrival[0])/1.5){
                price1=hotel.price*((return1[0]-arrival[0])/1.5)
            }
        }
        if(adults==1 & children == 0){  
            price1=hotel.price*((return1[0]-arrival[0]))
        }
        for (let i =arrival[0]; i<return1[0]; i++){
            if (monthArr[i] >= hotel.limit){
                count = -1
                break
            }
        }
        return price1, count1, 0
    }
    if( (arrival[1] < return1[1] & arrival[0] > return1[0] & arrival[2]==return1[2]) || (arrival[1]>return1[1] & arrival[0] > return1[0] & arrival[2] < return1[2] )){
        price1 = (hotel.price*adults/2+children*hotel.addPriceChild)*(return1[0]+(monthArr.length-1-arrival[0]))
        if(adults==0){
            if(price1<hotel.price*(return1[0]+(monthArr.length-1-arrival[0]))/1.5){
                price1=hotel.price*((return1[0]+(monthArr.length-1-arrival[0]))/1.5)
            }
        }
        if(adults==1 & children == 0){  
            price1=hotel.price*((return1[0]+(monthArr.length-1-arrival[0])))
        }
        for (let i =arrival[0]; i<monthArr.length; i++){
            if (monthArr[i] >= hotel.limit){
                count1 = -1
                break
            }
        }
        for (let i = 1; i<return1[0]; i++){
            if (monthRet[i] >= hotel.limit){
                count2 = -1
                break
            }
        }
    return [price1, count1, count2]  
    }
    return [price1, count1, count2]
}