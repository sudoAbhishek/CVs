import React from 'react';

const CVPreview = ({ cv, layoutOptions }) => {
    const previewWrapperStyle = {
        fontFamily: layoutOptions.font,
        fontSize: `${layoutOptions.fontSize}px`,
        color: "#333",
    };
    const profileImgStyle = { maxWidth: 150, height: "auto" };

    const getImageUrl = (imgPath) => {
        if (!imgPath) return '';
        if (imgPath.startsWith('/uploads')) {
            return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${imgPath}`;
        }
        return imgPath;
    };

    return (
        <div className="border rounded p-4" style={previewWrapperStyle}>
            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <h2 style={{ color: layoutOptions.color }}>{cv.personal?.name}</h2>
                    <p className="mb-1">{cv.personal?.email} | {cv.personal?.phone}</p>
                    <p className="small text-muted">
                        {cv.personal?.address} • {cv.personal?.city} • {cv.personal?.state} • {cv.personal?.pincode}
                    </p>
                </div>
                {cv.personal?.image && (
                    <img src={getImageUrl(cv.personal.image)} alt="Profile" style={profileImgStyle} className="ms-3" />
                )}
            </div>

            <hr />
            <strong style={{ color: layoutOptions.color }}>Summary</strong>
            <pre className="small">{cv.personal?.introduction}</pre>

            <h6 style={{ color: layoutOptions.color }}>Education</h6>
            {cv.education?.map((ed, i) => (
                <p key={i} className="mb-1">{ed.degree} - {ed.institution} ({ed.percentage})</p>
            ))}

            <h6 style={{ color: layoutOptions.color }} className="mt-2">Experience</h6>
            {cv.experience?.map((ex, i) => (
                <div key={i} className="mb-1">
                    <div><strong>{ex.position}</strong> at {ex.organization} ({ex.joiningDate} - {ex.leavingDate})</div>
                    <div className="small">CTC: {ex.ctc} • {ex.location}</div>
                    <div className="small">Tech: {ex.technologies}</div>
                    {ex.description && <div className="small">- {ex.description}</div>}
                </div>
            ))}

            <h6 style={{ color: layoutOptions.color }} className="mt-2">Projects</h6>
            {cv.projects?.map((p, i) => (
                <div key={i} className="mb-1">
                    <strong>{p.title}</strong>
                    <div className="small">TeamSize: {p.teamSize} • Duration: {p.duration}</div>
                    <div className="small">Tech: {p.technologies}</div>
                    <div className="small">- {p.description}</div>
                </div>
            ))}

            <h6 style={{ color: layoutOptions.color }} className="mt-2">Skills</h6>
            {cv.skills?.map((s, i) => <p key={i} className="mb-1">{s.name} - {s.level}%</p>)}

            <h6 style={{ color: layoutOptions.color }} className="mt-2">Social Media</h6>
            {cv.socials?.map((s, i) => <p key={i} className="mb-1">{s.platform} - {s.link}</p>)}
        </div>
    );
};

export default CVPreview;
