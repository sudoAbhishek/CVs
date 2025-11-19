import { FaEdit, FaDownload, FaShareAlt, FaTrash, FaEye } from "react-icons/fa";
import DEFAULT_IMAGE from "../assets/images.png";

const CVCard = ({ cv, cvImage, onEdit, onDelete, onDownload, onShare, onView }) => {

    return (
        <div className="card h-100 shadow-sm">
            <div style={{
                height: "200px",
                backgroundImage: cvImage
                    ? `url('${cvImage}')`
                    : `url('${DEFAULT_IMAGE}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderBottom: "1px solid #ddd"
            }}></div>
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{cv.personal?.name || "Untitled CV"}</h5>
                <p className="card-text">
                    {cv.personal?.email} · {cv.personal?.phone}
                </p>

                <div className="mt-auto d-flex flex-wrap gap-2">
                    <button
                        className="btn btn-secondary btn-sm d-flex align-items-center gap-1"
                        onClick={onView}
                        title="View CV"
                    >
                        <FaEye size={14} />
                    </button>

                    <button
                        className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                        onClick={onEdit}
                        title="Edit CV"
                    >
                        <FaEdit size={14} />
                    </button>

                    <button
                        className="btn btn-success btn-sm d-flex align-items-center gap-1"
                        onClick={onDownload}
                        title="Download CV"
                    >
                        <FaDownload size={14} />
                    </button>

                    <button
                        className="btn btn-info btn-sm text-white d-flex align-items-center gap-1"
                        onClick={onShare}
                        title="Share CV"
                    >
                        <FaShareAlt size={14} />
                    </button>

                    <button
                        className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                        onClick={onDelete}
                        title="Delete CV"
                    >
                        <FaTrash size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CVCard;
