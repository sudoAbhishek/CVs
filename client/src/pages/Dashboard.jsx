import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from "../services/api";
import { dummyData } from '../assets/dummyResume.js';
import CVCard from '../components/CVCard';
import CVPreview from '../components/CVPreview';

const DashboardPage = () => {
    const navigate = useNavigate();

    const [cvList, setCvList] = useState([]);
    const [cvImages, setCvImages] = useState({}); // Store image data URLs
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 1; // number of saved CVs per page

    // Share modal state
    const [shareModal, setShareModal] = useState({ open: false, url: "" });

    // View modal state
    const [viewModal, setViewModal] = useState({ open: false, cv: null });

    // Fetch saved CVs with pagination
    const fetchCVs = async () => {
        if (!hasMore) return;

        try {
            setLoading(true);

            const { data } = await API.get(`/api/resume?page=${page}&limit=${limit}`);

            // append resumes instead of replacing them
            setCvList((prev) => [...prev, ...data.resumes]);

            // Load images for each CV
            data.resumes.forEach(cv => {
                if (cv.personal?.image && cv.personal.image.startsWith('/uploads')) {
                    API.get(cv.personal.image, { responseType: 'blob' })
                        .then(res => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setCvImages(prev => ({
                                    ...prev,
                                    [cv._id]: reader.result
                                }));
                            };
                            reader.readAsDataURL(res.data);
                        })
                        .catch(err => console.error("Error loading image for CV:", cv._id, err));
                }
            });

            setHasMore(data.hasMore);
        } catch (error) {
            console.error("Error fetching CVs:", error);
        } finally {
            setLoading(false);
        }
    };

    // initial + next pages
    useEffect(() => {
        fetchCVs();
    }, [page]);

    // infinite scroll listener
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
                !loading &&
                hasMore
            ) {
                setPage((prev) => prev + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, hasMore]);

    const handleCreate = () => {
        navigate('/resumebuilder');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this CV?")) return;

        try {
            await API.delete(`/api/resume/${id}`);
            setCvList((prev) => prev.filter((cv) => cv._id !== id));
            alert('CV deleted successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to delete CV. Please try again.');
        }
    };

    const handlePayment = async (cv, actionType = "download") => {
        try {
            // 1️⃣ Ask backend to create order
            const { data: order } = await API.post("/api/payment/order");

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: "CVs",
                description: actionType === "share" ? "Payment for CV Sharing" : "Payment for Resume Download",
                order_id: order.id,

                handler: async function (response) {
                    try {
                        // 2️⃣ Verify payment on server
                        const verify = await API.post("/api/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            resumeId: actionType === "share" ? cv._id : null,
                        });

                        if (verify.data.status === "success") {
                            if (actionType === "share") {
                                // Generate share URL
                                const shareToken = verify.data.shareToken;
                                const shareUrl = `${window.location.origin}/shared/${shareToken}`;
                                setShareModal({ open: true, url: shareUrl });
                                // Try to copy to clipboard silently
                                navigator.clipboard.writeText(shareUrl).catch(() => { });
                            } else {
                                // 3️⃣ Download selected CV PDF
                                const pdf = await API.get(`/api/resume/${cv._id}/download`, {
                                    responseType: "blob"
                                });

                                const fileURL = window.URL.createObjectURL(new Blob([pdf.data]));
                                const link = document.createElement("a");
                                link.href = fileURL;
                                link.setAttribute("download", `${cv.personal?.name || "resume"}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            }
                        } else {
                            alert("Payment verification failed.");
                        }

                    } catch (err) {
                        console.error(err);
                        alert("Payment verification failed.");
                    }
                },

                theme: { color: "#3399cc" }
            };

            const razor = new window.Razorpay(options);
            razor.open();

        } catch (error) {
            console.error(error);
            alert("Unable to start payment");
        }
    };


    // Copy link handler for modal
    const handleCopyLink = () => {
        if (shareModal.url) {
            navigator.clipboard.writeText(shareModal.url)
                .then(() => alert("Link copied to clipboard!"))
                .catch(() => alert("Unable to copy. Please copy manually."));
        }
    };

    // Handle View CV
    const handleViewCV = (cv) => {
        setViewModal({ open: true, cv: cv });
    };

    return (
        <div className="container my-4">

            {/* Share Modal */}
            {shareModal.open && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.4)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <div style={{ background: "#fff", padding: 32, borderRadius: 8, minWidth: 320, boxShadow: "0 2px 16px #0002" }}>
                        <h4>Share Link</h4>
                        <input
                            type="text"
                            value={shareModal.url}
                            readOnly
                            style={{ width: "100%", margin: "12px 0", padding: 8, fontSize: 16 }}
                            onFocus={e => e.target.select()}
                        />
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button className="btn btn-primary" onClick={handleCopyLink}>Copy Link</button>
                            <button className="btn btn-secondary" onClick={() => setShareModal({ open: false, url: "" })}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewModal.open && viewModal.cv && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.5)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflowY: "auto"
                }}>
                    <div style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 300, maxWidth: 900, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 4px 20px #0002", margin: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h3>CV Preview</h3>
                            <button
                                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}
                                onClick={() => setViewModal({ open: false, cv: null })}
                            >
                                ✕
                            </button>
                        </div>
                        <CVPreview cv={viewModal.cv} layoutOptions={viewModal.cv.layoutOptions || { color: "#3956e6ff", font: "Helvetica", fontSize: 12 }} />
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="bg-light p-4 rounded text-center mb-4 shadow-sm">
                <h1 className="mb-3">Make a Great Resume Fast</h1>
                <p className="mb-3">
                    CVs helps you get a job-winning resume easily.
                    Pick a modern design and start writing now.
                </p>
            </div>

            {/* Templates Section */}
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Templates</h2>
                    <button className="btn btn-success" onClick={handleCreate}>
                        + New CV
                    </button>
                </div>
                <div className="row">
                    {dummyData.map((cv) => (
                        <div key={cv.title} className="col-md-4 mb-3">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">{cv.title}</h5>
                                    <p className="card-text">Click <b>Edit</b> to start this template</p>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => navigate('/resumebuilder', { state: { cvData: cv } })}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Saved CVs Section */}
            <div className="mb-4">
                <h2 className="mb-3">Your Saved CVs</h2>

                {cvList.length === 0 && !loading ? (
                    <div className="text-center py-4 border rounded">
                        <p>You haven’t created any CVs yet.</p>
                        <p>Click to get started.</p>
                    </div>
                ) : (
                    <div className="row">
                        {cvList.map((cv) => (
                            <div key={cv._id} className="col-md-4 mb-3">
                                <CVCard
                                    cv={cv}
                                    cvImage={cvImages[cv._id]}
                                    onView={() => handleViewCV(cv)}
                                    onEdit={() => navigate('/resumebuilder', { state: { cvData: cv } })}
                                    onDelete={() => handleDelete(cv._id)}
                                    onDownload={() => handlePayment(cv)}
                                    onShare={() => handlePayment(cv, "share")}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Loader */}
                {loading && (
                    <div className="text-center mt-3 mb-3">
                        <div className="spinner-border" role="status"></div>
                    </div>
                )}

                {/* No more data */}
                {!hasMore && cvList.length > 0 && (
                    <p className="text-center text-muted mt-3 mb-5">
                        You have reached the end.
                    </p>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
