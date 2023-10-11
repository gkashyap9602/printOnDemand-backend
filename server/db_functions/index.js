var helpers = require('../services/helper');

module.export = getDataArray = (Model, query, feilds, pagination=null, sort=null, populate=null) => {
    return new Promise((resolve, reject)=>{
        Model.find(query, feilds, pagination)
        .populate(populate)
        .sort(sort)
        .exec((err,data)=>{
            if(err || !data || data.length == 0){
                let response = helpers.showResponse(false,err);
                return resolve(response);
            } 
            let response = helpers.showResponse(true,"data found",data);
            return resolve(response);
        });
    })
}

module.export = getJoinData = async(Model, query, feilds, lookup=null, pagination=null, sortObj=null) => {
    return new Promise( async (resolve,reject)=>{
        try{
            let data = await Model.aggregate()
            .match(query)
            .lookup(lookup)
            .project(feilds)
            .sort(sortObj!==null?sortObj:{_id:0})
            .skip(pagination!==null?pagination.skip:0)
            .limit(pagination!==null?pagination.limit:Number.MAX_SAFE_INTEGER)
            if(data.length>0){
                return resolve(helpers.showResponse(true,"data found",data));
            } else {
                return resolve(helpers.showResponse(false,NO_DATA));
            }
        } catch(err){
            console.log(err)
            return resolve(helpers.showResponse(false,err.message));
        }
    })
}

module.export = getSingleData = (Model, query, feilds, populate=null) =>{
    console.log(query,"query")
    return new Promise((resolve,reject)=>{
        Model.findOne(query,feilds)
        .populate(populate)
        .exec((err,data)=>{
            if(err || !data){
                console.log(err,"errr getSingleData")
                let response = helpers.showResponse(false, 'retreive failed ', err);
                return resolve(response);
            } 
            let response = helpers.showResponse(true,"data found", data);
            return resolve(response);
        });
    })
}

module.export = postData = (modalRefrence) =>{
    return new Promise((resolve,reject)=>{
        modalRefrence.save((err,savedData) => {
            if(err){
                console.log(err)
                let response = helpers.showResponse(false,err);
                return resolve(response);
            } 
            let response = helpers.showResponse(true, 'success', savedData);
            return resolve(response);
        });
    })
}

module.export = insertMany = (Model, dataArray) =>{
    return new Promise((resolve,reject)=>{
        try{
            Model.insertMany(dataArray,(err,data)=>{
                if(err){
                    let response = helpers.showResponse(false, err);
                    return resolve(response);
                } 
                let response = helpers.showResponse(true, 'success', data);
                return resolve(response);
            })
            // let response = helpers.showResponse(true, 'success');
            // return resolve(response);
        } catch(err){
            let response = helpers.showResponse(false,err);
            return resolve(response);
        }
    })
}
 
module.export = updateData = (Model, DataObject, _id) =>{
    return new Promise((resolve,reject)=>{
        Model.findByIdAndUpdate(_id, { $set : DataObject },{new:true},(err,updatedData) => {
            if(err){
                let response = helpers.showResponse(false, err);
                return resolve(response);
            } 
            let response = helpers.showResponse(true, 'success', updatedData);
            return resolve(response);
        });
    });
}
module.export = removeItemFromArray = (Model, mainIdObj,arrayKey,itemId) =>{
    console.log(arrayKey,"arrayKey",[arrayKey])
    // let obj = {[arrayKey]:{_id:itemId}}
    
    return new Promise((resolve,reject)=>{
        Model.updateOne(mainIdObj,{$pull:{[arrayKey]:{_id:itemId}}},(err,updatedData) => {
            if(err){
                let response = helpers.showResponse(false, err,{});
                return resolve(response);
            } 
            if(updatedData?.modifiedCount>0){
                let response = helpers.showResponse(true, 'success', updatedData);
                return resolve(response);
            }
            let response = helpers.showResponse(false, 'failed',{});
            return resolve(response);
        });
    });
}
module.export = updateSingleData = (Model, DataObject, matchObj) =>{
    return new Promise((resolve,reject)=>{
        console.log(matchObj,"lklk")
        Model.findOneAndUpdate(matchObj, { $set : DataObject },{new:true},(err,updatedData) => {
            if(err){
                let response
                console.log(err?.name,"errname")
                // if(err.code === 11000 && err.name === 'MongoError'){
                //     response = helpers.showResponse(false, err);
                // }
                response = helpers.showResponse(false, err);

                return resolve(response);
            } 
            let response = helpers.showResponse(true, 'success', updatedData);
            return resolve(response);
        });
    });
}

module.export = updateByQuery = (Model, DataObject, filter) =>{
    return new Promise((resolve,reject)=>{
        Model.updateMany(filter, { $set : DataObject }, {"multi": true, "new": true}, (err,updatedData) => {
            if(err){
                let response = helpers.showResponse(false, err);
                return resolve(response);
            } 
            let response = helpers.showResponse(true, 'success', updatedData);
            return resolve(response);
        });
    });
}
 
module.export = deleteData =(Model, query)=>{
    return new Promise((resolve,reject)=>{
        Model.deleteMany(query, (err) => {
            if(err){
                let response = helpers.showResponse(false, err);
                return resolve(response);
            }
            let response = helpers.showResponse(true, 'success');
            return resolve(response);
        });
    }); 
}

module.export = deleteById = (Model, id)=>{
    return new Promise((resolve,reject)=>{
        Model.findByIdAndRemove(id, (err, result) => {
            if(err || !result){
                let response = helpers.showResponse(false, 'failed');
                return resolve(response);
            }
            let response = helpers.showResponse(true, 'success');
            return resolve(response);
        });
    }); 
}

module.export = getCount = (Model, query) => {
    return new Promise((resolve,reject)=>{
        Model.countDocuments(query, (err, result) => {
            if(err){
                let response = helpers.showResponse(false, 'failed', err,null,404);
                return resolve(response);
            }
            let response = helpers.showResponse(true, 'success' ,result,null,200);
            return resolve(response);
        });
    }); 
}