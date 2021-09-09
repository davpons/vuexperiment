import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, addDoc, getDoc, getDocs, updateDoc, onSnapshot, increment, query, where, orderBy } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.VUE_APP_FB_APIKEY,
    authDomain: process.env.VUE_APP_FB_AUTHDOMAIN,
    projectId: process.env.VUE_APP_FB_PROJECTID,
    storageBucket: process.env.VUE_APP_FB_STORAGEBUCKET,
    messagingSenderId: process.env.VUE_APP_FB_MESSAGINGSENDERID,
    appId: process.env.VUE_APP_FB_APPID
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

const usersCollection    = collection(db, 'users')
const postsCollection    = collection(db, 'posts')
const commentsCollection = collection(db, 'comments')
const likesCollection    = collection(db, 'likes')

const userSignIn = form => {
    const { email, password } = form
    return new Promise((resolve, reject) => {
        signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => resolve(userCredential.user))
        .catch(error => reject(error));
    })
}

const userSignOut = async () => {
    return new Promise((resolve, reject) => {
        signOut(auth)
        .then(() => resolve())
        .catch((error) => reject(error));
    })
}

const createUser = form => {
    const { email, password } = form
    return new Promise((resolve, reject) => {
        createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => resolve(userCredential.user))
        .catch(error => reject(error));
    })
}

const getUserProfile = async uid => {
    const docRef  = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        return docSnap.data()
    } else {
        return {}
    }
}

const addUserProfile = (uid, form) => {
    const { name, title } = form
    return new Promise((resolve, reject) => {
        setDoc(doc(db, "users", uid), {
            name: name,
            title: title
        })
        .then(() => resolve())
        .catch(reject)
    })
}

const updateUserProfile = async user => {
    const userDoc = doc(usersCollection, user.uid)
    await updateDoc(userDoc, {
        name: user.name,
        title: user.title
    })
}

const updateUserInAllPosts = async user => {
    const q = query(postsCollection, where("userId", "==", user.uid))
    const postDocs = await getDocs(q)
    postDocs.forEach(post => {
        updateDoc(doc(postsCollection, post.id), {
            userName: user.name
        })
    })
}

const updateUserInAllComments = async user => {
    const q = query(commentsCollection, where("userId", "==", user.uid))
    const commentDocs = await getDocs(q)
    commentDocs.forEach(comment => {
        updateDoc(doc(commentsCollection, comment.id), {
            userName: user.name
        })
    })
}

const resetPasswordEmail = email => {
    return new Promise((resolve, reject) => {
        sendPasswordResetEmail(auth, email)
        .then(() => resolve())
        .catch(error => reject(error))
    })
}

const addPost = async post => {
    const doc = await addDoc(postsCollection, post);
    return doc.id
}

const snapshotPosts = (commit) => {
    const q = query(postsCollection, orderBy("createdOn", "desc"))
    onSnapshot(q, (snapshot) => {
        let postsArray = []
        snapshot.forEach(doc => {
            let post = doc.data()
            post.id = doc.id

            postsArray.push(post)
        })

        commit('setPosts', postsArray)
    });
}

const addComment = async (postId, comment) => {
    await addDoc(commentsCollection, comment)
    const post = doc(db, "posts", postId)
    await updateDoc(post, {
        comments: increment(1)
    })
}

const getComments = async postId => {
    const q = query(commentsCollection, where("postId", "==", postId))
    const querySnapshot = await getDocs(q);
    let comments = [];

    querySnapshot.forEach(doc => {
        let comment = doc.data()
        comment.id  = doc.id
        comments.push(comment)
    });

    return comments
}

const addLike = async (post) => {
    const userId = auth.currentUser.uid
    const docId  = doc(likesCollection, userId+"_"+post.id)

    const docSnap = await getDoc(docId)

    if (docSnap.exists()) {
        return false;
    }

    // Añadir like
    await setDoc(docId, {
        postId: post.id,
        userId: userId
    })

    // Actualizar conteo likes en el post
    await updateDoc(doc(postsCollection, post.id), {
        likes: increment(1)
    })

    return true
}

export {
    auth,
    usersCollection,
    postsCollection,
    commentsCollection,
    likesCollection,
    userSignIn,
    userSignOut,
    createUser,
    addUserProfile,
    updateUserProfile,
    getUserProfile,
    resetPasswordEmail,
    addPost,
    snapshotPosts,
    addComment,
    getComments,
    addLike,
    updateUserInAllPosts,
    updateUserInAllComments
}
