import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import CVPreview from '../components/CVPreview';

const SharedCV = () => {
    const { shareToken } = useParams();
    const [cv, setCv] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [layoutOptions, setLayoutOptions] = useState({
        color: "#3956e6ff",
        font: "Helvetica",
        fontSize: 12,
    });

    useEffect(() => {
        const fetchSharedCV = async () => {
            try {
                setLoading(true);
                // This route doesn't need authentication
                const response = await API.get(`/api/resume/shared/${shareToken}`);
                if (response.data.status === 'success') {
                    setCv(response.data.resume);
                    if (response.data.resume.layoutOptions) {
                        setLayoutOptions(response.data.resume.layoutOptions);
                    }
                } else {
                    setError("CV not found");
                }
            } catch (err) {
                console.error("Error fetching shared CV:", err);
                setError("Unable to load this CV. It may have been removed or the link is invalid.");
            } finally {
                setLoading(false);
            }
        };

        if (shareToken) {
            fetchSharedCV();
        }
    }, [shareToken]);

    if (loading) {
        return (
            <div className="container my-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container my-4">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error</h4>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!cv) {
        return (
            <div className="container my-4">
                <div className="alert alert-info" role="alert">
                    CV not found
                </div>
            </div>
        );
    }


    return (
        <div className="container my-4">
            <div className="row">
                {/* Preview */}
                <div className="col-lg-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h2 className="card-title mb-4">Preview</h2>
                            <CVPreview cv={cv} layoutOptions={layoutOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedCV;
