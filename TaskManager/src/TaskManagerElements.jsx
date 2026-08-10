import {useDraggable, useDroppable} from '@dnd-kit/react';
import {label, statuses, todo} from "./constants.jsx";
import Popup from 'reactjs-popup';
import {useState} from "react";

export const Trash = () =>{
    const {ref} = useDroppable({
        id:'trash'
    })
    return (
        <div>
            <Popup className="trash_popup"
                trigger = {
                    <button id="trash_button" type={"button"} onClick={() => {}}>
                        <img src="trash.png" alt="Trash: drag and drop a task here to delete it." ref={ref} className="trash"/>
                    </button>
                }
                position="top">
                <div className="trash_popup">
                    Drag and drop a task onto the trash can to delete it.
                </div>
            </Popup>
        </div>
    )
}

export const TaskContainer = ({label, status, children}) => {
    const {ref} = useDroppable({
        id:status
    })

    return (
        <div ref={ref} className={"column"}>
            {label}:
            <br/>
            {children}
        </div>
    )
}

export const Task = ({task, id, updateTask}) => {
    const [newName, setNewName] = useState(task['name']);
    const [newDescription, setNewDescription] = useState(task['description']);
    const {ref} = useDraggable( {
        id: id
    })

    return (
        <div className="task" ref={ref} >
            {task['title']}
            <Popup className="edit_popup"
                   trigger={
                       <button className={'button'} id={"edit_task_button"}
                               onClick={() => {
                                   setNewName(task['title']);
                                   setNewDescription(task['description']);
                               }}>
                           Edit
                       </button>
                   }
            >
                <div className='edit_popup_element'>
                    <h4  className='edit_popup_element'>Name:</h4>
                    <input className='edit_popup_element' id="input" placeholder={task['title']} defaultValue={task['title']} onChange={(e) => {
                        let s = e.target.value
                        if (s === "") {
                            setNewName(task['title']);
                        } else {
                            setNewName(s)
                        }
                    }} />
                </div>
                <div className='edit_popup_element'>
                    <h4 className='edit_popup_element'>Description:</h4>
                    <textarea className='edit_popup_element' id="input" defaultValue={task['description']} onChange={(e) => {setNewDescription(e.target.value)}} />
                </div>
                <div className='edit_popup_element' id="save_edit_button">
                    <button className="edit_popup_element" id='save_edit_button' onClick={() => {
                        if (newName !== task['title']) {
                            updateTask({id:id, category:'title', value:newName})
                        }
                        if (newDescription !== task['description']) {
                            updateTask({id:id, category:'description', value:newDescription})
                        }
                    }}>Save</button>
                </div>
            </Popup>

        </div>
    )
}

export const NewTask = ({createTask, setPage}) => {
    const [title, setTitle] = useState('')
    const [status, setStatus] = useState(todo)
    const [description, setDescription] = useState('')

    return (
        <>
            <div>
                <h3>Name:</h3>
                <input id="input"  placeholder="Please enter a name" onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
                <h3>Status:</h3>
                <select name="status" onChange={(e) => setStatus(e.target.value)}>
                    {statuses.map(status => (
                        <option key={status} value={status}>{label[status]}</option>
                    ))}
                </select>
            </div>
            <div>
                <h3>Description: (optional)</h3>
                <textarea id="input" rows='5' cols='50' onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
                <button className='button' id='task_button' onClick={() => {setPage('home')}}>Cancel</button>
                <button disabled={title===''} className='button' id='task_button' onClick={() => {
                    createTask({title:title, status:status, description:description})
                    setPage('home')

                }}>Create task</button>
            </div>
        </>
    )
}
