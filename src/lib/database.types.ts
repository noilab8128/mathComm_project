export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    category_id: number
                    name: string
                    level: number
                    parent_id: number | null
                }
                Insert: {
                    category_id?: number
                    name: string
                    level: number
                    parent_id?: number | null
                }
                Update: {
                    category_id?: number
                    name?: string
                    level?: number
                    parent_id?: number | null
                }
            }
            problems: {
                Row: {
                    id: string
                    title: string
                    content: string
                    difficulty: number
                    category_level1: number | null
                    category_level2: number | null
                    category_level3: number | null
                    category_path: string | null
                    level: string | null
                    age_range: string | null
                    tags: string[] | null
                    diagram_image_url: string | null
                    is_generated: boolean
                    ai_confidence: number | null
                    concepts: string[] | null
                    source: string | null
                    license: string | null
                    is_reviewed: boolean
                    reviewer_id: string | null
                    created_at: string
                    updated_at: string
                    search_vector: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    difficulty: number
                    category_level1?: number | null
                    category_level2?: number | null
                    category_level3?: number | null
                    category_path?: string | null
                    level?: string | null
                    age_range?: string | null
                    tags?: string[] | null
                    diagram_image_url?: string | null
                    is_generated?: boolean
                    ai_confidence?: number | null
                    concepts?: string[] | null
                    source?: string | null
                    license?: string | null
                    is_reviewed?: boolean
                    reviewer_id?: string | null
                    created_at?: string
                    updated_at?: string
                    search_vector?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    difficulty?: number
                    category_level1?: number | null
                    category_level2?: number | null
                    category_level3?: number | null
                    category_path?: string | null
                    level?: string | null
                    age_range?: string | null
                    tags?: string[] | null
                    diagram_image_url?: string | null
                    is_generated?: boolean
                    ai_confidence?: number | null
                    concepts?: string[] | null
                    source?: string | null
                    license?: string | null
                    is_reviewed?: boolean
                    reviewer_id?: string | null
                    created_at?: string
                    updated_at?: string
                    search_vector?: string | null
                }
            }
            solutions: {
                Row: {
                    id: string
                    problem_id: string
                    content: string
                    sequence_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    problem_id: string
                    content: string
                    sequence_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    problem_id?: string
                    content?: string
                    sequence_order?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            problem_hierarchies: {
                Row: {
                    id: string
                    parent_problem_id: string
                    parent_solution_id: string | null
                    child_problem_id: string
                    stage_name: string | null
                    sequence_order: number
                    depth: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    parent_problem_id: string
                    parent_solution_id?: string | null
                    child_problem_id: string
                    stage_name?: string | null
                    sequence_order: number
                    depth?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    parent_problem_id?: string
                    parent_solution_id?: string | null
                    child_problem_id?: string
                    stage_name?: string | null
                    sequence_order?: number
                    depth?: number
                    created_at?: string
                }
            }
            user_queue: {
                Row: {
                    user_id: string
                    problem_id: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    problem_id: string
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    problem_id?: string
                    created_at?: string
                }
            }
            user_category_levels: {
                Row: {
                    user_id: string
                    category_id: number
                    level_score: number
                    is_inferred: boolean
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    category_id: number
                    level_score: number
                    is_inferred?: boolean
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    category_id?: number
                    level_score?: number
                    is_inferred?: boolean
                    updated_at?: string
                }
            }
            user_likes: {
                Row: {
                    user_id: string
                    problem_id: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    problem_id: string
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    problem_id?: string
                    created_at?: string
                }
            }
        }
    }
}
