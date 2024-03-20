import { useState } from 'react';
import Button from '../../../components/button/Button';
import { createGroup } from '../../../service/group';
import { useAppContext } from '../../../context/appContext';
import { checkGroupData } from '../../../validations/groupData';
import { saveImage } from '../../../service/storage';
import './CreateGroup.css';

export default function CreateGroup() {
  const { userData } = useAppContext();
  const [error, setError] = useState({
    groupName: '',
    groupDescription: ''
  });
  const [currentGroup, setCurrentGroup] = useState({
    name: '',
    description: '',
    image: '',
    imageFile: File as any,
    type: 'public'

  });
  const createCurrentGroup = async () => {
    const check = checkGroupData(currentGroup.name, currentGroup.description);
    if (check.groupName || check.groupDescription) {

      setError(check);
      return;
    }
    let currentImageUrl = '' as any;
    if (currentGroup.image) {
      currentImageUrl = await saveImage(currentGroup.imageFile);
    }


    const group = {
      title: currentGroup.name,
      description: currentGroup.description,
      type: currentGroup.type,
      image: currentImageUrl,
      members: [],
      createdOn: Number(new Date()),
      owner: userData.username
    };

    createGroup(group, userData);
  };
  return (
    <div className='create-group-form '>
      <h2 className="heading">Create Group</h2>
      <div className="form">
        {currentGroup.image && <img src={currentGroup.image} alt="group" className='create-group-img' />}
        <form>
          <div className="form-group">
            <label htmlFor="name" id='name-label'>Name:</label>
            <input className="input" type="text" id="name-input" value={currentGroup.name} onChange={(e) => setCurrentGroup({ ...currentGroup, name: e.target.value })} />
            {error.groupName && <p style={{ color: 'red', fontSize: 'small' }} className='error'>{error.groupName}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="description" id='description-label'>Description:</label>
            <input className="input" type="text" id="description" value={currentGroup.description} onChange={(e) => setCurrentGroup({ ...currentGroup, description: e.target.value })} />
            {error.groupDescription && <p style={{ color: 'red', fontSize: 'small' }} className='error'>{error.groupDescription}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="input-image" id='label-image'>Image:</label>
            <input className="input" id="input-img" type="file" accept="image/*" onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const imageUrl = URL.createObjectURL(e.target.files[0]);
                setCurrentGroup({ ...currentGroup, image: imageUrl, imageFile: e.target.files[0] });
              }
            }}>

            </input><br></br>
            <label htmlFor="type" id='type-label'>Type:</label>
            <select  className="input" id="type" value={currentGroup.type} onChange={(e) => setCurrentGroup({ ...currentGroup, type: e.target.value })}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </form>
        <Button className="btn" onClick={createCurrentGroup}>Create</Button>
      </div>
    </div>
  );
}