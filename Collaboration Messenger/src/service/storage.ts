import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../config/config-firebase";



/**
 * Saves an image file to Firebase storage.
 * @param file - The image file to be saved.
 * @returns A Promise that resolves to the download URL of the saved image.
 */
export const saveImage = async (file: File) => {
    if (!file) {
        return;
    }
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}