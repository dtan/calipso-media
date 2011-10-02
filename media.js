/**
 * Media management module
 */
var rootpath = process.cwd() + '/',
  path = require('path'),
  calipso = require(path.join(rootpath, 'lib/calipso'));

exports = module.exports = {
  init: init, 
  route: route
};

/**
 * Router
 */
function route(req,res,module,app,next) {

      // Menu
      res.menu.admin.addMenuItem({name:'Media Management',path:'cms/media',url:'/media',description:'Manage media ...',security:[]});      
      res.menu.primary.addMenuItem({name:'Photo Galleries',path:'gallery',url:'/gallery',description:'Gallery ...',security:[]});

      // Routes
      module.router.route(req,res,next);

};

/**
 * Init
 */
function init(module,app,next) {

  // Any pre-route config
  calipso.lib.step(
      function defineRoutes() {

        // Administrative page
        module.router.addRoute('GET /media',mediaList,{template:'media.list',block:'content',admin:true},this.parallel());

        // General image upload
        module.router.addRoute('POST /media/upload',mediaUpload,{admin:true},this.parallel());
        module.router.addRoute('POST /media/update',mediaUpdate,{admin:true},this.parallel());
        module.router.addRoute('GET /media/delete/:id',mediaDelete,{admin:true},this.parallel());
        module.router.addRoute('GET /media/show/:id',mediaShow,{admin:true, block:'content.media.show'},this.parallel());
        module.router.addRoute('GET /media/edit/:id',mediaEditForm,{admin:true, block:'content.media.edit'},this.parallel());

        // Gallery functions
        module.router.addRoute('GET /gallery',galleryList,{template:'gallery.list',block:'content.gallery.list'},this.parallel());
        module.router.addRoute('GET /gallery/create',galleryCreateForm,{block:'content.gallery.create',admin:true},this.parallel());
        module.router.addRoute('POST /gallery/upsert',galleryUpsert,{admin:true},this.parallel());
        module.router.addRoute('GET /gallery/show/:gallery',galleryShow,{template:'gallery.show',block:'content.gallery.show'},this.parallel());              
        module.router.addRoute('GET /gallery/edit/:gallery',galleryEditForm,{block:'content.gallery.edit',admin:true},this.parallel());        
        module.router.addRoute('GET /gallery/show/:gallery/image/:id',galleryMediaShow,{template:'gallery.media.show',block:'content.gallery.media.show'},this.parallel());
        module.router.addRoute('GET /gallery/delete/:gallery',galleryDelete,{},this.parallel());              

      },
      function done() {

        // Schema
        var Media = new calipso.lib.mongoose.Schema({
          name:{type: String, required: true},
          mediaType:{type: String, required: true},
          path:{type: String, required: true},
          author:{type: String, required: true},
          ispublic:{type: Boolean, required: true, "default": false},
          gallery:{type: String},
          thumb:{type: String},
          prevId:{type: String},
          nextId:{type: String},
          sort:{type: Number,"default":0},          
          tags:[String],
          description:String,          
          created: { type: Date, "default": Date.now },
          updated: { type: Date, "default": Date.now }
        });

        calipso.lib.mongoose.model('Media', Media);

        // Schema
        var MediaGallery = new calipso.lib.mongoose.Schema({
          url:{type: String, required: true},
          name:{type: String, required: true},
          description:{type: String, required: true},
          author:{type: String, required: true},
          coverImage:{type: String},
          ispublic:{type: Boolean, required: true, "default": false},
          created: { type: Date, "default": Date.now },
          updated: { type: Date, "default": Date.now }
        });

        calipso.lib.mongoose.model('MediaGallery', MediaGallery);

        // Add static
        app.use(calipso.lib.express["static"](__dirname + '/static'));

        // Any schema configuration goes here
        next();

      }
  );


};

/**
 *  The standard upload form
 */ 
function getUploadForm() {
  
  return {id:'media-upload-form',title:'Upload files ...',type:'form',method:'POST',action:'/media/upload',tabs:false,
          fields:[                    
            {label:'Files', id:'files-upload', name:'files', type:'file', multiple:true, description:'Select the images to upload ...'}
          ],
          buttons:[
               {name:'submit',type:'submit',value:'Upload Files'},
               {name:'cancel',type:'button',href:'/gallery', value:'Cancel'}
          ]};    
}

/**
 *  The gallery edit form
 */ 
function getGalleryForm() {
  
  return {id:'gallery-form',title:'Create gallery ...',type:'form',method:'POST',action:'/gallery/upsert',tabs:false,
          fields:[
              {label:'URL', name:'mediaGallery[url]', type:'text', description:'Enter a url for your gallery (numbers and letters only). this will be the unique key.'},
              {label:'Name', name:'mediaGallery[name]', type:'text', description:'Enter a name for your gallery ...'},              
              {label:'Description', name:'mediaGallery[description]', type:'textarea', description:'Describe this gallery ...'},
              {label:'Is Public?', name:'mediaGallery[ispublic]', type:'checkbox', description:'Should this be publically visible?'}
          ],          
          buttons:[
               {name:'submit',type:'submit',value:'Save Gallery'},
               {name:'cancel',type:'button',href:'/gallery', value:'Cancel'}
          ]};    
}

/**
 *  The gallery edit form
 */ 
function getMediaForm() {
  
  return {id:'media-form',title:'Edit Metadata ...',type:'form',method:'POST',action:'/media/update',tabs:false,
          fields:[              
              {label:'', name:'media[_id]', type:'hidden'},    
              {label:'Name', name:'media[name]', type:'text', description:'Enter the name of this photo ...'},              
              {label:'Description', name:'media[description]', type:'textarea', description:'Describe this photo ...'},
              {label:'Tags', name:'media[tags]', type:'text', description:'Enter tags (comma delimited)'}
          ],          
          buttons:[
               {name:'submit',type:'submit',value:'Save Image Metadata'}
          ]};    
}

/**
 * Admininstrative list of media
 */
function mediaList(req,res,template,block,next) {
  // To do 
  next();  
}

function mediaShow(req,res,template,block,next) {
  // To do 
  next();  
}
 

function mediaEditForm(req,res,template,block,next) {
 
 // To do 
  var mediaId = req.moduleParams.id;
  var returnTo = req.moduleParams.returnTo || "/media";
  var Media = calipso.lib.mongoose.model('Media');  

  var mediaForm = getMediaForm();

  // Add cancel button
  mediaForm.buttons.push({name:'cancel',type:'button',href:returnTo, value:'Cancel'});
  mediaForm.fields.push({name:'returnTo',type:'hidden'});

  Media.findOne({_id:mediaId}, function(err,media) {
    var values = {media: media, returnTo: returnTo};        
    calipso.form.render(mediaForm,values,req,function(form) {
      calipso.theme.renderItem(req,res,form,block,{},next);
    });  
  })
    
}

function mediaUpdate(req,res,template,block,next) {

  // Check to see if we are updating one, or the sort
  var mediaId = req.formData.media._id;
  var returnTo = req.formData.returnTo || "/media";
  var Media = calipso.lib.mongoose.model('Media');  

  Media.findOne({_id:mediaId}, function(err,media) {
    
    calipso.form.mapFields(req.formData.media,media);

    media.save(function(err) {
      
      if(req.formData.type === 'json') {
        res.end(err ? "ERROR" : "OK");
      } else {
        if(err) {  
          req.flash('info',req.t('Unable to update the image because {msg}',{msg:err.message}));        
        } else {        
          req.flash('info',req.t('The image has now been updated.'));        
        }
        res.redirect(returnTo);
        next();              
      }
    })      
    
  })

}

function mediaDelete(req,res,template,block,next) {

  var mediaId = req.moduleParams.id;
  var returnTo = req.moduleParams.returnTo || "/media";
  var Media = calipso.lib.mongoose.model('Media');

  if(mediaId === 'all') {

    var gallery = req.moduleParams.gallery, async = require('async');

    Media.find({gallery:gallery}, function(err,items) {
      
      async.map(items,doDeleteMedia,function(err,result) {      
        if(err) {
          req.flash('info',req.t('Unable to delete all images because {msg}',{msg:err.message}));        
        } else {        
          req.flash('info',req.t('The images have now been deleted.'));        
        }
        res.redirect(returnTo);
        next();                

      });
      
    })    
    
  } else {

    Media.findOne({_id:mediaId}, function(err,media) {
      doDeleteMedia(media,function(err,result) {
        if(err) {
          req.flash('info',req.t('Unable to delete the image because {msg}',{msg:err.message}));        
        } else {        
          req.flash('info',req.t('The image has now been deleted.'));        
        }
        res.redirect(returnTo);
        next();              
      });  
    })

  }
  
}
 
 
/**
 * Gallery functions
 */

/**
 * Display a gallery with upload form to add images
 */
function galleryShow(req,res,template,block,next) {

  var uploadForm = getUploadForm();   
  var galleryUrl = req.moduleParams.gallery || '';

  var Media = calipso.lib.mongoose.model('Media');
  var Gallery = calipso.lib.mongoose.model('MediaGallery');

  res.menu.adminToolbar.addMenuItem({name:'List',weight:1,path:'list',url:'/gallery',description:'Return to list ...',security:[]});
  res.menu.adminToolbar.addMenuItem({name:'Edit',weight:2,path:'edit',url:'/gallery/edit/' + galleryUrl,description:'Edit Gallery ...',security:[]});
  res.menu.adminToolbar.addMenuItem({name:'Delete Gallery',weight:4,path:'delete',url:'/gallery/delete/' + galleryUrl,description:'Delete Gallery ...',security:[]});
  res.menu.adminToolbar.addMenuItem({name:'Delete All',weight:3,path:'deleteall',url:'/media/delete/all?gallery=' + galleryUrl + '&returnTo=/gallery/show/' + galleryUrl, description:'Delete Image ...',security:[]});

  // Add hidden tag to allow attachment to a gallery  
  uploadForm.fields.push({label:'',type:'hidden',name:'mediaGallery[url]'})
  var values = {
    mediaGallery: {
      url: galleryUrl
    }
  };

  // Check public
  var isAdmin = req.session && req.session.user && req.session.user.isAdmin;  
  var query = {url:galleryUrl};
  if(!isAdmin) {
    query.ispublic = true;
  }

  // Get the gallery
  Gallery.findOne(query, function(err, gallery) {

    if(!err && gallery) {

      // Get our content
      Media.find({gallery:galleryUrl}).sort('sort',1).find(function(err, media) {

        calipso.form.render(uploadForm,values,req,function(form) {
          calipso.theme.renderItem(req,res,template,block,{gallery:gallery, media:media, form:form},next);
        });
    
      });
    } else {
      req.flash('error',req.t('You are not able to view media in that gallery ...'));
      res.redirect("/gallery");
      next();
    }

  });
  
  
}

/**
 * Display media in a gallery
 */
function galleryMediaShow(req,res,template,block,next) {

  var Media = calipso.lib.mongoose.model('Media');
  var Gallery = calipso.lib.mongoose.model('MediaGallery');

  var mediaId = req.moduleParams.id;
  var galleryUrl = req.moduleParams.gallery;

  res.menu.adminToolbar.addMenuItem({name:'Gallery',weight:2,path:'gallery',url:'/gallery/show/' + galleryUrl,description:'Back to Gallery ...',security:[]});
  res.menu.adminToolbar.addMenuItem({name:'Edit',weight:2,path:'edit',url:'/media/edit/' + mediaId + '?returnTo=/gallery/show/' + galleryUrl + '/image/' + mediaId,description:'Edit Image ...',security:[]});
  res.menu.adminToolbar.addMenuItem({name:'Delete',weight:3,path:'delete',url:'/media/delete/' + mediaId + '?returnTo=/gallery/show/' + galleryUrl, description:'Delete Image ...',security:[]});

  // Check public
  var isAdmin = req.session && req.session.user && req.session.user.isAdmin;  
  var query = {url:galleryUrl};
  if(!isAdmin) {
    query.ispublic = true;
  }

  // Get the gallery
  Gallery.findOne(query, function(err, gallery) {
    
    // Check to see if we can see it
    if(!err && gallery) {        
        
        // Get our media
        Media.findOne({_id:mediaId}, function(err,media) {
          calipso.theme.renderItem(req,res,template,block,{gallery:galleryUrl, media:media},next);    
        });

    } else {
      req.flash('error',req.t('You are not able to view media in that gallery ...'));
      res.redirect("/gallery");
      next();
    }

  });
  
}

/**
 * List of galleries - either all or just for a user
 */
function galleryList(req,res,template,block,next) {

  var Gallery = calipso.lib.mongoose.model('MediaGallery');

  res.menu.adminToolbar.addMenuItem({name:'Create',weight:1,path:'create',url:'/gallery/create',description:'Create New ...',security:[]});

  // Check public
  var isAdmin = req.session && req.session.user && req.session.user.isAdmin;  
  var query = {};
  if(!isAdmin) {
    query.ispublic = true;
  }

  // Get the galleries
  Gallery.find(query, function(err, galleries) {

    // Render the item via the template provided above
    calipso.theme.renderItem(req,res,template,block,{galleries:galleries},next);

  });

};

/**
 * List of galleries - either all or just for a user
 */
function galleryCreateForm(req,res,template,block,next) {

  var galleryForm = getGalleryForm();   

  var values = {    
  };

  calipso.form.render(galleryForm,values,req,function(form) {
    calipso.theme.renderItem(req,res,form,block,{},next);
  });
  
};

/**
 * List of galleries - either all or just for a user
 */
function galleryEditForm(req,res,template,block,next) {

  var galleryForm = getGalleryForm();   
  var galleryUrl = req.moduleParams.gallery || '';

  var Media = calipso.lib.mongoose.model('Media');
  var Gallery = calipso.lib.mongoose.model('MediaGallery');

  // Get the gallery
  Gallery.findOne({url:galleryUrl}, function(err, gallery) {

    // Get the media, so we can add a select
    Media.find({gallery:galleryUrl}, function(err, media) {

      var coverItems = [];
      media.forEach(function(item) {
          coverItems.push({label:item.name, value:item.thumb});
      })
      galleryForm.fields.push({name:'mediaGallery[coverImage]', label:'Cover Image', type:'select', options:coverItems, description:'Select the image to use as the gallery image ...'})

      var values = {mediaGallery:gallery};
      calipso.form.render(galleryForm,values,req,function(form) {
        calipso.theme.renderItem(req,res,form,block,{},next);
      });

    });

  });

};


/**
 * Create or update a gallery
 */
function galleryUpsert(req,res,template,block,next) {
  
  var Gallery = calipso.lib.mongoose.model('MediaGallery');

  if(req.formData.mediaGallery) {
      
    var galleryUrl = req.formData.mediaGallery.url;

    // First, lets try and find our gallery
    Gallery.findOne({url:galleryUrl}, function(err, g) {

      if(err) return next(err);

      if(g) {
        
        if(req.formData.mediaGallery._id) {
            
          // If we have been provided with an _id we are updating

          calipso.form.mapFields(req.formData.mediaGallery, g);
          g.save(function(err) {   
          
            if(req.formData.type === 'json') {
              // Updates allowed via json
              res.end(err ? "ERROR" : "OK");
            } else {     
              if(err) {
                req.flash('error',err.message);          
              } else {
                req.flash('info',req.t('Gallery saved ...'));                   
              }
              res.redirect("/gallery/show/" + galleryUrl); 
              return next(err);  
            }
          });

        } else {
          
          // Assume we are trying to sort it - THIS CANNOT work on paged results      
          // For some reason it comes back from jquery as {'':order};
          var orderedArray = req.formData.mediaGallery.sortOrder[''];          
          gallerySortFromArray(orderedArray, function(err,result) {
            res.end(err ? "ERROR" : "OK");            
          });
        }

      } else {
        
        // Create
        var g = new Gallery(req.formData.mediaGallery);

        // Additional fields
        g.author = req.session.user.username;

        g.save(function(err) {        
          if(err) {
            req.flash('error',err.message);
            res.redirect("/gallery");
          } else {
            req.flash('info',req.t('Gallery created successfully ...'));
            res.redirect("/gallery/show/" + galleryUrl);          
          }
          return next(err);  
        })

        
      }

    });

   } else {
   
      return next(new Error("Unable to locate the specified gallery to update."));
     
   }


}

function gallerySortAfterUpload(galleryUrl, newMedia, next) {
  
    // Initialise the sort order of the items
    // results is the images just added, but we need to add the images we already have first
    var Media = calipso.lib.mongoose.model('Media');      
    Media.find({gallery:galleryUrl}).where('sort').gt(0).sort('sort',1).find(function(err, media) {               

      if(err) return next(err);

      var orderedArray = [];
      media.forEach(function(item) {
          orderedArray.push(item._id);
      })
      newMedia.forEach(function(item) {
          orderedArray.push(item);
      })

      gallerySortFromArray(orderedArray, next);

    });

}

/**
 * Sort a gallery based on a provided list of ordered mediaIds
 */
 function gallerySortFromArray(orderedArray, next) {
   
  var async = require('async'), counter = 0;
  var Media = calipso.lib.mongoose.model('Media');

   // Sort based on the order provided, can either be text (a property) or an array of ids
  var mediaOrder = function(mediaId, next) {

   // Find the current media in the array to lets us save prev / next
   var currentIndex = calipso.lib._.indexOf(orderedArray, mediaId), 
       prevId = (currentIndex > 0 ? orderedArray[currentIndex - 1] : ''),
       nextId = (currentIndex !== orderedArray.length - 1 ? orderedArray[currentIndex + 1] : '');
   
   // Get the media, so we can add a select
    Media.findById(mediaId, function(err, media) {
      counter ++;
      media.sort = counter;
      media.nextId = nextId;
      media.prevId = prevId;
      media.save(function(err) {
        next(err);  
      });              
    });     
         
  }

  async.map(orderedArray, mediaOrder, next);

 }

/**
 * List of galleries - either all or just for a user
 */
function galleryDelete(req,res,template,block,next) {

  var async = require('async');
  var Media = calipso.lib.mongoose.model('Media');
  var MediaGallery = calipso.lib.mongoose.model('MediaGallery');

  var galleryUrl = req.moduleParams.gallery;

  // For now we won't delete the media!

  MediaGallery.findOne({url:galleryUrl}, function(err, g) {

    // Delete the media first - any failures stop delete of the gallery
    Media.find({gallery:galleryUrl}, function(err, media) {

      async.map(media,doDeleteMedia,function(err,result) {
        
        if(err) {
          req.flash('info',req.t('Unable to delete the gallery because {msg}',{msg:err.message}));        
          return next();
        }        

        // Delete the gallery
        MediaGallery.remove({_id:g._id}, function(err) {
          if(err) {
            req.flash('info',req.t('Unable to delete the gallery because {msg}',{msg:err.message}));        
          } else {        
            req.flash('info',req.t('The gallery has now been deleted.'));        
          }
          res.redirect("/gallery");
          next();
        });
                
      });
            
    });

  });

};

function doDeleteMedia(media, next) {  
  
  var Media = calipso.lib.mongoose.model('Media'), fs = require('fs');

  // Delete the file first
  try {
    fs.unlinkSync(path.join(rootpath,"media",media.path));
    if(media.thumb) {
      fs.unlinkSync(path.join(rootpath,"media",media.thumb));
    }
  } catch(ex) {
    if(ex.code === "ENOENT") {
      return next();
    } else {
      return next(ex);      
    }
    
  }

  // We can't delete the directory because we are not sure if it is empty
  // TODO : recursively delete folders that are empty

  // Delete the media in mongoose
  Media.remove({_id:media._id}, next);

}

/**
 * General purpose forms and functions
 */
function mediaUploadForm(req,res,template,block,next) {

    var uploadForm = uploadForm();   
    var values = {};

    calipso.form.render(uploadForm,values,req,function(form) {
      calipso.theme.renderItem(req,res,template,block,{form:form},next);
    });

};

/**
 * File upload
 */
function mediaUpload(req, res, template, block, next) {    

    var async = require('async'),
        basePath = "media/uploads";
    
    // Set the author
    var author;
    if(req.session && req.session.user) {      
      author = req.session.user.username;
    } else {
      author = 'Unknown';
    }

    // Get the
    var gallery;
    if(req.formData.mediaGallery) {
      gallery = req.formData.mediaGallery;
      returnTo = "/gallery/show/" + gallery.url;
    } else {
      returnTo = "/media";
    }
    
    var fileQueue = [];
    for(var upload in req.uploadedFiles) {
      var upload = req.uploadedFiles[upload];
      upload.forEach(function(file) {        
        var toFile = path.join(rootpath, basePath, mediaPath(path.basename(file.path)));
        fileQueue.push({gallery: gallery, author: author, file: file, from: file.path, to: toFile});
      });      
    }

    // Process everything in the queue - do it in series for now
    async.mapSeries(fileQueue,processFile,function(err, results) {            
      
      if(err) {
        console.dir(err);        
        next(err);
      }
        
      
      gallerySortAfterUpload(gallery.url, results, function(err) {
        res.redirect(returnTo);
        next(err);
      });

    });

};

function processFile(file, next) {

  var tbHeight = '100';

  var im = require('imagemagick');
  
  // Create our mongoose object
  var Media = calipso.lib.mongoose.model('Media');  

  // For each file, we need to process it
  mv(file.from, file.to,function() {    

    // Now, create the mongoose object for it
    var m = new Media();
    m.name = file.file.name;
    m.mediaType = file.file.type;
    m.path = file.to.replace(path.join(rootpath,"media"),"");
    m.author = file.author;
    m.sort = -1;
    if(file.gallery) {
      m.gallery = file.gallery.url;
    }

    im.identify(file.to, function(err, ident_metadata){

      // If imagemagick fails (not installed) ignore silently
      if (!err) {    
        
        var thumb = path.join(
            path.dirname(file.to),
            path.basename(file.to, path.extname(file.to)) + "-thumb" + path.extname(file.to));
        
        m.thumb = thumb.replace(path.join(rootpath,"media"),"");;

        im.readMetadata(file.to, function(err, exif_metadata) {

          var metadata = calipso.lib._.extend(ident_metadata, exif_metadata);

          // Set our metadata
          m.set('metadata',metadata);          

          fixRotation(m, function(err, m) {

            // Resize the image to create a thumb
            // mogrify -resize 80x80 -background white -gravity center -extent 80x80 -format jpg -quality 75 -path thumbs *.jpg

            var isPortrait = (metadata.width < metadata.height);
            var thumbSize = 'x120';

            im.convert([file.to, '-resize', thumbSize,'-filter','lagrange','-sharpen','0.2','-quality','80', thumb], function(err, stdout, stderr) {
              if (err) throw err                
              m.save(function(err) {
                next(err, m._id);  
              })    
            });

          });

        });
        
      } else {
        
        calipso.silly("ImageMagick failed, no thumbnail or rotation available ...");

        m.save(function(err) {
          next(err);  
        });

      }      

    });
    
  });  

}

/**
 * Check to see if the image should be rotated
 */ 
function fixRotation(media, next) {
    
    var metadata = media.get('metadata');
    var im = require('imagemagick');

    // Check to see if it is rotated
    // See http://sylvana.net/jpegcrop/exif_orientation.html

    var rotate_image, img = path.join(rootpath,"media",media.path);

    if(metadata && metadata.exif && metadata.exif.orientation === 6) {
      rotate_image = [img,'-rotate','90',img]
    } else if(metadata && metadata.exif && metadata.exif.orientation === 7) {
      rotate_image = [img,'-rotate','-90',img]
    }
      
    if(rotate_image) {
      metadata.rotated = true;
      media.set('metadata',metadata);
      im.convert(rotate_image, function(err, stdout, stderr) {
        next(err, media);
      });
    } else {
      next(null,media);  
    }

}

/**
 * Util functions - should be moved out into utils
 */
function mediaPath(filePath) {
  
  var max = 3, split = 2;
  var newPath = "";

  // Convert the uploaded file guid into a path for saving    
  for(var i = 1; i <= max; i++) {
    newPath += filePath.substring((i-1)*split, (i-1)*split + split) + "/";
  }
  filePath = filePath.substring(max*split - 1, filePath.length);

  return newPath + filePath;

}

function mv(from, to, next) {

  var fs = require('fs'),
      mkdirp = require('mkdirp'),
      util = require('util');

  calipso.silly("Moving file " + from + " to " + to + "...");

  mkdirp(path.dirname(to), 0755, function (err) {

    var is = fs.createReadStream(from);
    var os = fs.createWriteStream(to);

    util.pump(is, os, function() {
      fs.unlinkSync(from);
      next(err);
    });

  });

}
