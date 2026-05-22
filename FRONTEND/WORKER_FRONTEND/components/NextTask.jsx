"use client";
import {BACKEND_URL} from '../utilies';
import axios from "axios";
import { useEffect, useState } from "react";

export const NextTask = () => {
    const [currentTask, setCurrentTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios.get(`${BACKEND_URL}/v1/worker/nextTask`, {
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        })
            .then(res => {
                setCurrentTask(res.data.task);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                setCurrentTask(null);
            });
    }, []);

    const handleOptionSelect = async (optionId) => {
        setSubmitting(true);
        try {
            const response = await axios.post(`${BACKEND_URL}/v1/worker/submission`, {
                taskId: currentTask.id.toString(),
                selection: optionId.toString()
            }, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });

            const nextTask = response.data.nextTask;
            setCurrentTask(nextTask || null);
        } catch (e) {
            console.error("Submission failed:", e);
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700">Loading tasks...</p>
                </div>
            </div>
        );
    }

    if (!currentTask) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Tasks Available</h3>
                    <p className="text-gray-600">
                        Please check back later. There are no pending tasks at the moment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">{currentTask.title}</h2>
                        {submitting && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </span>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentTask.options.map(option => (
                            <Option
                                key={option.id}
                                imageUrl={option.image_url}
                                onSelect={() => handleOptionSelect(option.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

function Option({ imageUrl, onSelect }) {
    return (
        <div 
            onClick={onSelect}
            className="cursor-pointer group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
        >
            <img
                className="w-full h-64 object-cover"
                src={imageUrl}
                alt="Task option"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="bg-white text-blue-600 px-4 py-2 rounded-full font-medium shadow-sm">
                        Select This Option
                    </span>
                </div>
            </div>
        </div>
    );
}