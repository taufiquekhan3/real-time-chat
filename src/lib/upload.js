import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";



    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "chat-App_upload"); // Add your upload preset
        formData.append("cloud_name", "de9h38grf");
    
        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/de9h38grf/image/upload", {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
            return data.secure_url; // This is the URL of the uploaded image
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            return null;
        }
    };
    
    export default uploadToCloudinary;






    
// const upload = async (file) => {
    
//     const storage = getStorage();
//     const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);

//     // const storageRef = ref(storage, `images/${Date.now()+file.name}`);

//     const uploadTask = uploadBytesResumable(storageRef, file);

//     return new Promise((resolve, reject) => {
//         uploadTask.on('state_changed',
//             (snapshot) => {
//                 // Observe state change events such as progress, pause, and resume
//                 // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
//                 const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//                 console.log('Upload is ' + progress + '% done');
//                 switch (snapshot.state) {
//                     case 'paused':
//                         console.log('Upload is paused');
//                         break;
//                     case 'running':
//                         console.log('Upload is running');
//                         break;
//                 }
//             },
//             (error) => {
//                 // Handle unsuccessful uploads
//             },
//             () => {
//                 // Handle successful uploads on complete
//                 // For instance, get the download URL: https://firebasestorage.googleapis.com/...
//                 getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
//                     return (downloadURL)
//                 });
//             }
//         );
//     })
//     // Register three observers:
//     // 1. 'state_changed' observer, called any time the state changes
//     // 2. Error observer, called on failure
//     // 3. Completion observer, called on successful completion


// }

// export default upload
