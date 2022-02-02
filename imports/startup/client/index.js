// Import client startup through a single index entry point
import './routes.js';
import Swal from 'sweetalert2';
import slugify from 'slugify';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document/build/ckeditor';
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytes  } from "firebase/storage";

function basicStyle (message, type){
    let style = {
      html: '<div style="color: white; text-align: left">' + message + '</div>',
      backdrop: false,
      position: 'top-right',
      timer: 2000,
      showConfirmButton: false,
      width: '300px',
      customClass: {
        header: 'align-items-unset padding-0',
        content: 'align-items-unset padding-0',
      },
      allowOutsideClick: false,
    };
    if(type == "success"){
      style.background = '#087830'
      style.title = '<div style="color: white; text-align: left;">Sukses</div>'
    }
    else if(type == "fail"){
      style.background = '#F47174'
      style.title = '<div style="color: white; text-align: left;">Error</div>'
    }
    return style;
  }

initializeStorage = function (){
  const firebaseConfig = {
      apiKey: "AIzaSyDCdkNoArtxUolzKtoWgFemVxZZ11aAX8A",
      projectId: "imavistatic",
      storageBucket: "imavistatic.appspot.com",
      appId: "1:859691038944:web:d37ba9bd6f30c41c5f7885",
    };
    const firebaseApp = initializeApp(firebaseConfig);
    const storage = getStorage(firebaseApp);
    return storage
}
uploadImageFile = function (_id, image, identifier) {
  if (image === undefined) {
    return
  }
  const file = image
  if (!file.type.match('image.*')) {
    alert('Please upload an image.')
    return
  }
  const metadata = {
    contentType: file.type
  }
  this.isUploadingImage = true
  const storage = initializeStorage()
  const imageRef = ref(storage,`${identifier}/${_id}`)
  uploadBytes(imageRef, file).then((snapshot) => {
    console.log('Image Uploaded Successfully');
  });
  return
}
getFireImage = function (path, id){
  const storage = initializeStorage();
  const url = ref(storage, path);
  getDownloadURL(url)
    .then((url) => {
      $('#'+id).attr('src',url)
    })
  .catch((error) => {
    switch (error.code) {
      case 'storage/object-not-found':
        console.log('Image not found')
        break;
      case 'storage/unauthorized':
        console.log('Unauthorized')
        break;
      case 'storage/canceled':
        console.log('User Cancelled')
        break;
      case 'storage/unknown':
        console.log('Unknown Error Occured')
        break;
    }
  });
}

successAlert = function(message){
    if(typeof message === 'undefined'){
        message = 'Berhasil!';
    }
    Swal.fire(basicStyle(message, 'success'));
}

successAlertBack = function(message){
    if(typeof message === 'undefined'){
        message = 'Berhasil!';
    }
    Swal.fire(basicStyle(message, 'success'));
    history.back();
  }

failAlert = function(message){
    if(typeof message === 'object' && message !== null){
        message = message.reason;
    }
    Swal.fire(basicStyle(message, 'fail'));
}

confirmationAlertAsync = async function(additionalMessage){
    if(typeof message === 'undefined'){
        additionalMessage = '';
    }
    try{
        let result = await Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah anda yakin? ' + additionalMessage,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Iya',
        cancelButtonText: 'Tidak'
        })
        return result;
    }
    catch(e){
        console.error(e);
    }
}

/* Tujuan :
-Agar setiap slug dari setiap collection sifatnya unik
-Agar pengambilan dan pemeriksaan slugnya lebih pendek codingnya */
checkSlug = async function(code, options){
/*     Deskripsi :
    Function ini akan mengembalikan promise yang akan
    dichain dengan proses lainnya */
    return await new Promise((resolve, reject) => {
      // Merupakan id textbox yang digunakan untuk edit nilai slugnya
      // jika tidak disertakan di option maka nilai defaultnya adalah 'slug'
      let inputId = 'slug'
      if(options){
        if(options.inputId){
          inputId = options.inputId
        }
      }
      // Untuk sanitize slugnya mengingat slugnya bisa diedit
      // setelah sanitize masukkin ke textboxnya
      const slug = slugify($('#' + inputId).val(), {
        lower: true,
        strict: true,
      })
      $('#' + inputId).val(slug);
      if(checkValid(slug) && slug.length <= 60){
        const body = {
          code,
          slug,
          dbField: 'slug' // Field apa yang digunakan collection untuk menampung slugnya
        }
        if(options){
          if(options.editId){
            // Menjamin agar saat proses edit dan slugnya tidak berubah
            // , tidak dianggap error oleh methodnya
            body.editId = options.editId
          }
          if(options.dbField){
            body.dbField = options.dbField
          }
        }
        // Jika error atau nilainya tidak sesuai gunakan reject
        // Gunakan resolve untuk mengembalikan hasil yang akan dipakai proses berikutnya
        Meteor.call('cim-checkSlug', body, function (error, result) {
          if (error) {
              failAlert(error)
              reject(error.reason);
          }  else if(result) {
              failAlert('Silahkan gunakan slug yang lain')
              reject('Silahkan gunakan slug yang lain');
          } else {
              resolve(slug);
          }
        });
      } else {
        failAlert('Slug harus ada dan panjangnya maksimum 60 karakter')
      }
    })
}

/* Tujuan:
-Inisiasi WYSIWYG menggunakan CKEditor 5 DecoupledEditor
-Agar proses inisiasi cukup memanggil method ini tanpa perlu tulis kodingan inisiasi berulang-ulang */
initEditor = async function(template, options){
  /*     Deskripsi :
    Function ini akan memulai pembuatan WYSIWYG menggunakan Id Elemen yang disediakan
    dan menghasilkan editor yang disimpan di template.editor*/
  let editorEl = 'editor'
  let toolbarEl = 'toolbar-container'
  let content = ''
  let templateField = 'editor'
  if(options){
    if(options.editorEl){
      editorEl = options.editorEl
    }
    if(options.toolbarEl){
      toolbarEl = options.toolbarEl
    }
    if(options.content){
      content = options.content
    }
    if(options.templateField){
      templateField = options.templateField
    }

  }

    DecoupledEditor
    .create( document.querySelector( '#' + editorEl ) )
    .then( editor => {
        // Jika .create-nya selesai maka akan menghasilkan editor di parameternya
        // Ini untuk toolbarnya yang seperti MS Word
        const toolbarContainer = document.querySelector( '#' + toolbarEl );
        toolbarContainer.appendChild( editor.ui.view.toolbar.element );
        editor.setData(content)
        // Ini diperlukan agar template pemanggilnya bisa mengakses nilainya
        template[templateField].set(editor)
    } )
    .catch( error => {
        console.error( error );
    });

}

checkValid = function (data){
  switch (data) {
    case '':
      return false
    case 'null':
      return false
    case null:
      return false
    case undefined:
      return false
    default:
      return true
  }
}

initSelect2 = function (options){
  setTimeout(() => {
    if(!options){
      options = {}
    }
    const{ elementOptions, id, value } = options
    $('.select2').select2(elementOptions);
    if(checkValid(id) && checkValid(value)){
      $('#' + id).val(value).trigger('change')
    }
  }, 200)
}
