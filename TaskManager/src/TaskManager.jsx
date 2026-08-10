import {DragDropProvider} from '@dnd-kit/react';
import {useState} from "react";
import "./constants.jsx"
import {columns, label, statuses, supabase, todo} from "./constants.jsx";
import {Task, NewTask, Trash, TaskContainer} from "./TaskManagerElements.jsx";

//initialize task dictionary
const loadTasks = async () => {

    //pull users tasks from db
    const {data, error} = await supabase.from('Tasks').select([...columns, 'id'].join(', '));
    if (error) {
        console.log(error)
        return
    }

    //put data into dictionary: {id:{status, title}}
    let taskDictionary = {}
    for (let i = 0; i < data.length; i++) {
        let entry = data[i]
        let dict= {}
        for (let column of columns) {
            dict[column] = entry[column]
        }
        taskDictionary[entry['id']] = dict
    }

    return taskDictionary
}

export const TaskManager = () => {
    const [error, setError] = useState(false)
    //tasks is a dictionary where the id is the key to a dictionary
    const [tasks, setTasks] = useState(() => {
        let p = loadTasks()
        p.then((t) => {
            setTasks(t)
        },(error) => {
            console.log(error)
            setError(true)
        })
        return {}
    })
    const [page, setPage] = useState('home')



    //update a value of a task:
    //tasks[id][category]= value
    const updateTask = async ({id, category, value}) => {
        if (tasks[id] == null) {return}
        if (tasks[id][category] === value) {return}
        let oldValue = tasks[id][category]
        console.log("changing " + category + " of id " + id + " to " + value)
        setTasks((prevTasks) => {
            return {
                ...prevTasks,          // 2. Copy the top-level tasks object
                [id]: {                // 3. Target the specific task by ID
                    ...prevTasks[id],  // 4. Copy the existing task properties
                    [category]: value // 5. Overwrite only the specific category
                }
            };
        });

        const {data, error} = await supabase.rpc('update_' + category, {task_id:id, value:value})
        if (error) {
            console.log(error)
            //undo change if there's some error
            setTasks((prevTasks) => {
                return {
                    ...prevTasks,
                    [id]: {
                        ...prevTasks[id],
                        [category]: oldValue
                    }
                };
            });
        }
    }

    //create a new task with title and status
    const createTask = async ({title, status, description}) => {
        const {data, error} = await supabase.rpc('new_task', {new_title:title, new_status:status, new_description:description})
        if (error) {
            console.log(error)
            return
        }
        setTasks((prevTasks) => {
                return {
                    ...prevTasks, [data]: {
                        ['title']: title,
                        ['status']: status,
                        ['description']: description
                    }
                }
            }
        )
    }

    const deleteTask = async ({id}) => {
        let task = tasks[id]
        setTasks((prevTasks) => {
            let copy = {...prevTasks}
            delete copy[id]
            return copy
        })
        const {data, error} = await supabase.rpc('delete_task', {task_id:id})
        if (error) {
            console.log(error)
            //undo if error
            setTasks((prevTasks) => {
                return {...prevTasks, [id]: task}
            })
        }
    }

    return (
        <>
            {page ==='home' &&
                <DragDropProvider
                    onDragEnd={(event) => {
                        if (event.canceled) {return;}
                        if (event.operation.target?.id === 'trash') {
                            deleteTask({id:event.operation.source.id})
                            return
                        }
                        updateTask({id:event.operation.source.id, category:'status', value:event.operation.target?.id})
                    }}
                >
                    {error ? <h2 id='error'>ERROR: Please reload</h2> : null}
                    <div>
                        <button className='button' id="task_button" onClick={() => {setPage('new_task')}}>New Task</button>
                        <div className="row">
                            {statuses.map(status => (
                                <TaskContainer key={status} status={status} label={label[status]} createTask={createTask}>
                                    {Object.keys(tasks).map(id => (
                                        tasks[id]['status'] === status ? <Task onClick={()=>setPage('new_task')} task={tasks[id]} key={id} id={id} updateTask={updateTask}/> : null
                                    ))}
                                </TaskContainer>
                            ))}
                        </div>
                        <div>
                            <Trash/>
                        </div>
                    </div>
                </DragDropProvider>
            }
            {page === 'new_task' &&
                <NewTask setPage={setPage} createTask={createTask} />
            }
        </>
    )
}