import {createClient} from "@supabase/supabase-js";



const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

//status values
export const todo='todo'
export const done = 'done'
export const inProgress = 'in_progress'
export const inReview = 'in_review'
export const statuses = [todo, inProgress, inReview, done]
export const label = {todo: "To Do", done: "Done", in_progress: "In Progress", in_review: "In Review"}

//character limits for html
export const descriptionLength = 4096
export const titleLength = 250

export const columns = ['title', 'status', 'description']

export const domain = 'https://taskmanager.chirpsoft.workers.dev/'

export const serverError = "An error occurred: Server error"