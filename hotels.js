const express = require('express')
const router = express.Router()
let { hotels } = require('./database')

router.get('/', (req, res) =>{
    res.status(200).json({success:true, data:hotels})
})

router.get('/:id', (req, res) =>{
    const {id} = req.params
    const hotel = hotels.find((hotels)=> hotels.id === Number(id))
    if (!hotel){
        return res.status(404).json({success:false, msg:`no hotel with id: ${id}`})
    }
    res.status(200).json({success:true, data:hotel})
})

router.post('/', (req, res) =>{
    const {name} = req.body
    if (!name){
        return res.status(401).json({success:false, msg:'Please provide name value'})
    } 
    //const hotel = hotels.find((hotel)=> hotel.id === Number(id))
    hotels = [...hotels,{id:hotels.length+1, name: name}]
    return res.status(201).json({success:true, data: hotels})
})

router.put('/:id', (req, res)=>{
    const {id} = req.params
    const {name} = req.body

    const hotel = hotels.find((hotels)=> hotels.id === Number(id))
    if (!hotel){
        return res.status(404).json({success:false, msg:`no hotel with id: ${id}`})
    }
    const newHotel = hotels.map((hotel) =>{
        if (hotel.id === Number(id)){
            hotel.name = name
        }
        return hotel
    })

    return res.status(200).json({success:true, data: newHotel})
})

router.delete('/:id', (req, res) =>{
    const {id} = req.params
    const {name} = req.body
    const hotel = hotels.find((hotel)=> hotel.id === Number(id))
    if (!hotel){
        return res.status(404).json({success:false, msg:`no hotel with id: ${id}`})
    }
    const newHotel = hotels.filter((hotel) => (hotel.id !== Number(id)))
    hotels = newHotel
    return res.status(200).json({success:true, data:newHotel})
})


router.get('/', (req, res) =>{
    const {arrivalDate, returnDate, people} = req.body
    console.log(arrivalDate, returnDate, people)

})

module.exports = router



function getArr(arrival, ret){
    var monthArr= []
    var monthRet = []

    if (arrival == 12){
        monthArr= hotel.days.dec
    }
    else if (arrival == 1){
        monthArr= hotel.days.jun
    }
    else if (arrival == 2){
        monthArr= hotel.days.feb
    }
    else if (arrival == 3){
        monthArr= hotel.days.mar
    }
    else if (arrival == 4){
        monthArr= hotel.days.apr
    }
    else if (arrival == 5){
        monthArr= hotel.days.may
    }
    else if (arrival == 6){
        monthArr= hotel.days.juny
    }
    else if (arrival == 7){
        monthArr= hotel.days.july
    }
    else if (arrival == 8){
        monthArr= hotel.days.aug
    }
    if (ret == 12){
        monthRet= hotel.days.dec
    }
    else if (ret == 1){
        monthRet= hotel.days.jun
    }
    else if (ret == 2){
        monthRet= hotel.days.feb
    }
    else if (ret == 3){
        monthRet= hotel.days.mar
    }
    else if (ret == 4){
        monthRet= hotel.days.apr
    }
    else if (ret == 5){
        monthRet= hotel.days.may
    }
    else if (ret == 6){
        monthRet= hotel.days.juny
    }
    else if (ret == 7){
        monthRet= hotel.days.july
    }
    else if (ret == 8){
        monthRet= hotel.days.aug
    }
    return arrival, ret 
}

