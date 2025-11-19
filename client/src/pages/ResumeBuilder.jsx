import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";


export default function ResumeBuilderBootstrap() {
    const location = useLocation();
    const navigate = useNavigate();

    const emptyState = {
        personal: {
            image: "",
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            introduction: "",
        },
        education: [{ degree: "", institution: "", percentage: "" }],
        experience: [
            {
                organization: "",
                location: "",
                position: "",
                ctc: "",
                joiningDate: "",
                leavingDate: "",
                technologies: "",
                description: "",
            },
        ],
        projects: [
            {
                title: "",
                teamSize: "",
                duration: "",
                technologies: "",
                description: "",
            },
        ],
        skills: [{ name: "", level: "" }],
        socials: [{ platform: "", link: "" }],
    };

    const [data, setData] = useState(emptyState);

    const [layoutOptions, setLayoutOptions] = useState({
        color: "#3956e6ff",
        font: "Helvetica",
        fontSize: 12,
    });
    const [layoutChoice, setLayoutChoice] = useState("Basic");
    const [newData, setNewData] = useState({});
    const [originalImagePath, setOriginalImagePath] = useState(null); // Store original image path for updates
    // errors keyed by field paths, e.g. "personal.name", "education.0.degree"
    const [errors, setErrors] = useState({});
    // // touched fields to support blur validation UX
    // const [touched, setTouched] = useState({});

    useEffect(() => {
        if (location.state && location.state.cvData) {
            const cv = location.state.cvData;
            setNewData(cv);

            // Store the original image path for later use during update
            if (cv.personal?.image) {
                setOriginalImagePath(cv.personal.image);
            }

            // Handle image - if it's a server path, fetch it via API; if it's base64, use as-is
            if (cv.personal?.image && cv.personal.image.startsWith('/uploads')) {
                // It's a server path, fetch via API and convert to base64 for preview
                API.get(cv.personal.image, { responseType: 'blob' })
                    .then(res => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setData(prev => ({
                                ...prev,
                                personal: {
                                    ...prev.personal,
                                    image: reader.result
                                }
                            }));
                        };
                        reader.readAsDataURL(res.data);
                    })
                    .catch(err => console.error("Error loading image:", err));
            }

            setData({
                personal: cv.personal || emptyState.personal,
                education: cv.education || emptyState.education,
                experience: cv.experience || emptyState.experience,
                projects: cv.projects || emptyState.projects,
                skills: cv.skills || emptyState.skills,
                socials: cv.socials || emptyState.socials,
            });
            setLayoutOptions(cv.layoutOptions || layoutOptions);
            setLayoutChoice(cv.layoutChoice || "Basic");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    // ---------------------------
    // Validation helpers
    // ---------------------------
    const setFieldError = (key, message) => {
        setErrors((prev) => {
            if (!message) {
                const { [key]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [key]: message };
        });
    };

    const validateEmail = (val) => {
        if (!val) return "Email is required";
        // simple regex
        if (!/\S+@\S+\.\S+/.test(val)) return "Invalid email address";
        return "";
    };

    const validatePhone = (val) => {
        if (!val) return "Phone is required";
        if (!/^\d+$/.test(val)) return "Phone must contain only digits";
        if (val.length !== 10) return "Phone must be 10 digits";
        return "";
    };

    const validateRequired = (val, label = "This field") => {
        if (val === undefined || val === null) return `${label} is required`;
        if (typeof val === "string" && !val.trim()) return `${label} is required`;
        return "";
    };

    const validatePositiveNumber = (val, label = "Value") => {
        if (val === "" || val === null || val === undefined) return `${label} is required`;
        if (!/^\d+(\.\d+)?$/.test(String(val))) return `${label} must be a positive number`;
        if (Number(val) < 0) return `${label} must be positive`;
        return "";
    };

    const validatePercentage = (val) => {
        if (val === "" || val === null || val === undefined) return "Percentage is required";
        if (!/^\d+(\.\d+)?$/.test(String(val))) return "Percentage must be a number";
        const n = Number(val);
        if (n < 0 || n > 100) return "Percentage must be between 0 and 100";
        return "";
    };

    // generic per-field validator (used for live/mixed validation)
    const validateField = ({ section, index, field, value }) => {
        // personal fields
        if (section === "personal") {
            if (field === "name") return validateRequired(value, "Name");
            if (field === "email") return validateEmail(value);
            if (field === "phone") return validatePhone(value);
            if (field === "city") return validateRequired(value, "City");
            if (field === "state") return validateRequired(value, "State");
            if (field === "pincode") {
                if (!value) return "Pincode is required";
                if (!/^\d+$/.test(String(value))) return "Pincode must be numeric";
                return "";
            }
            // introduction is long text -> validate on blur
            return "";
        }

        // education items
        if (section === "education") {
            if (field === "degree" || field === "institution") {
                return validateRequired(value, field === "degree" ? "Degree" : "Institution");
            }
            if (field === "percentage") return validatePercentage(value);
        }

        // experience items
        if (section === "experience") {
            if (field === "organization" || field === "position") {
                return validateRequired(value, field === "organization" ? "Organization" : "Position");
            }
            if (field === "ctc") return validatePositiveNumber(value, "CTC");
            // joining/leaving date: optional; no strict validation here
            if (field === "technologies") return ""; // optional
            if (field === "description") return ""; // validate on blur
        }

        // projects
        if (section === "projects") {
            if (field === "title") return validateRequired(value, "Project Title");
            if (field === "teamSize") return value ? validatePositiveNumber(value, "Team size") : "";
            return "";
        }

        // skills
        if (section === "skills") {
            if (field === "name") return validateRequired(value, "Skill name");
            if (field === "level") {
                if (value === "" || value === null || value === undefined) return "Skill level is required";
                if (!/^\d+$/.test(String(value))) return "Skill level must be an integer 0-100";
                const n = Number(value);
                if (n < 0 || n > 100) return "Skill level must be between 0 and 100";
            }
        }

        // socials
        if (section === "socials") {
            // optional validation - if provided, must be a valid-looking url (basic)
            if (field === "link" && value) {
                if (!/^https?:\/\/.+/.test(value)) return "Link must start with http:// or https://";
            }
        }

        return "";
    };

    // validate entire form (used on save/update)
    const validateForm = () => {
        const newErrors = {};

        // personal
        ["name", "email", "phone", "city", "state", "pincode"].forEach((f) => {
            const msg = validateField({ section: "personal", field: f, value: data.personal[f] });
            if (msg) newErrors[`personal.${f}`] = msg;
        });

        // optional check for introduction length if present
        if (data.personal.introduction && data.personal.introduction.length > 2000) {
            newErrors["personal.introduction"] = "Introduction is too long";
        }

        // education
        data.education.forEach((ed, i) => {
            ["degree", "institution", "percentage"].forEach((f) => {
                const msg = validateField({ section: "education", index: i, field: f, value: ed[f] });
                if (msg) newErrors[`education.${i}.${f}`] = msg;
            });
        });

        // experience
        data.experience.forEach((ex, i) => {
            ["organization", "position", "ctc"].forEach((f) => {
                const msg = validateField({ section: "experience", index: i, field: f, value: ex[f] });
                if (msg) newErrors[`experience.${i}.${f}`] = msg;
            });
            // optional: check date order if both provided
            if (ex.joiningDate && ex.leavingDate && new Date(ex.joiningDate) > new Date(ex.leavingDate)) {
                newErrors[`experience.${i}.dates`] = "Joining date cannot be after leaving date";
            }
        });

        // projects
        data.projects.forEach((p, i) => {
            const msg = validateField({ section: "projects", index: i, field: "title", value: p.title });
            if (msg) newErrors[`projects.${i}.title`] = msg;
        });

        // skills
        data.skills.forEach((s, i) => {
            ["name", "level"].forEach((f) => {
                const msg = validateField({ section: "skills", index: i, field: f, value: s[f] });
                if (msg) newErrors[`skills.${i}.${f}`] = msg;
            });
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ---------------------------
    // Handlers for input changes
    // ---------------------------
    // Generic handler for personal fields (live validation for most)
    const handlePersonalChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, personal: { ...prev.personal, [name]: value } }));

        // live validation for required & numeric & email
        if (["name", "email", "phone", "city", "state", "pincode"].includes(name)) {
            const msg = validateField({ section: "personal", field: name, value });
            setFieldError(`personal.${name}`, msg || "");
        }

        // clear intro errors while typing lightly? We validate intro on blur (mixed strategy)
        if (name === "introduction") {
            // if it's too long live-checking for a huge value might be useful
            if (value && value.length > 2000) {
                setFieldError("personal.introduction", "Introduction is too long");
            } else {
                setFieldError("personal.introduction", "");
            }
        }
    };

    // Generic handler for array fields with mixed validation logic
    const handleArrayChange = (section, index, field, value, opts = {}) => {
        const updated = [...data[section]];
        updated[index] = { ...updated[index], [field]: value };
        setData({ ...data, [section]: updated });

        // Live validation for number/required fields
        const liveValidateFields = {
            education: ["degree", "institution", "percentage"],
            experience: ["organization", "position", "ctc"],
            projects: ["title", "teamSize"],
            skills: ["name", "level"],
            socials: ["link"],
        };

        if (liveValidateFields[section] && liveValidateFields[section].includes(field)) {
            const msg = validateField({ section, index, field, value });
            setFieldError(`${section}.${index}.${field}`, msg || "");
        }

        // For description fields we validate on blur (mixed strategy)
        if (field === "description" && opts.validateOnBlurOnly) {
            // do nothing here
        }
    };

    const addArrayItem = (section, emptyItem) => {
        setData({ ...data, [section]: [...data[section], emptyItem] });
    };

    // onBlur handler for fields we want to validate on blur (long text)
    const handleBlur = (section, index, field) => {
        // mark touched
        const key = section ? `${section}.${index || 0}.${field}` : `personal.${field}`;
        // setTouched((t) => ({ ...t, [key]: true }));

        let value;
        if (section === "personal") value = data.personal[field];
        else value = data[section][index][field];

        const msg = validateField({ section, index, field, value });
        // additional long-text checks
        if (section === "personal" && field === "introduction") {
            if (value && value.length > 2000) {
                setFieldError(`personal.introduction`, "Introduction is too long");
                return;
            }
        }
        if (section === "experience" && field === "description") {
            if (value && String(value).length > 1500) {
                setFieldError(`experience.${index}.description`, "Description is too long");
                return;
            }
        }
        // set or clear error
        if (msg) setFieldError(`${section}.${index}.${field}`, msg);
        else setFieldError(`${section}.${index}.${field}`, "");
    };

    // ---------------------------
    // Image handler
    // ---------------------------
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () =>
            setData((prev) => ({
                ...prev,
                personal: {
                    ...prev.personal,
                    image: reader.result,
                    _imageFile: file // Store the file object
                }
            }));
        reader.readAsDataURL(file);
    };

    // ---------------------------
    // Layout options handler
    // ---------------------------
    const handleLayoutChange = (e) => {
        const { name, value } = e.target;
        setLayoutOptions({ ...layoutOptions, [name]: value });
    };

    // ---------------------------
    // Save & Update
    // ---------------------------
    const handleSaveResume = async () => {
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            alert("Please fix the highlighted errors before saving.");
            return;
        }

        try {
            const formData = new FormData();

            // Add all data fields
            formData.append("personal[name]", data.personal.name);
            formData.append("personal[email]", data.personal.email);
            formData.append("personal[phone]", data.personal.phone);
            formData.append("personal[address]", data.personal.address);
            formData.append("personal[city]", data.personal.city);
            formData.append("personal[state]", data.personal.state);
            formData.append("personal[pincode]", data.personal.pincode);
            formData.append("personal[introduction]", data.personal.introduction);

            // Add education
            data.education.forEach((ed, i) => {
                formData.append(`education[${i}][degree]`, ed.degree);
                formData.append(`education[${i}][institution]`, ed.institution);
                formData.append(`education[${i}][percentage]`, ed.percentage);
            });

            // Add experience
            data.experience.forEach((ex, i) => {
                formData.append(`experience[${i}][organization]`, ex.organization);
                formData.append(`experience[${i}][location]`, ex.location);
                formData.append(`experience[${i}][position]`, ex.position);
                formData.append(`experience[${i}][ctc]`, ex.ctc);
                formData.append(`experience[${i}][joiningDate]`, ex.joiningDate);
                formData.append(`experience[${i}][leavingDate]`, ex.leavingDate);
                formData.append(`experience[${i}][technologies]`, ex.technologies);
                formData.append(`experience[${i}][description]`, ex.description);
            });

            // Add projects
            data.projects.forEach((p, i) => {
                formData.append(`projects[${i}][title]`, p.title);
                formData.append(`projects[${i}][teamSize]`, p.teamSize);
                formData.append(`projects[${i}][duration]`, p.duration);
                formData.append(`projects[${i}][technologies]`, p.technologies);
                formData.append(`projects[${i}][description]`, p.description);
            });

            // Add skills
            data.skills.forEach((s, i) => {
                formData.append(`skills[${i}][name]`, s.name);
                formData.append(`skills[${i}][level]`, s.level);
            });

            // Add socials
            data.socials.forEach((so, i) => {
                formData.append(`socials[${i}][platform]`, so.platform);
                formData.append(`socials[${i}][link]`, so.link);
            });

            // Add layout options
            formData.append("layoutOptions[color]", layoutOptions.color);
            formData.append("layoutOptions[font]", layoutOptions.font);
            formData.append("layoutOptions[fontSize]", layoutOptions.fontSize);
            formData.append("layoutChoice", layoutChoice);

            // Add image file if exists
            if (data.personal._imageFile) {
                formData.append("image", data.personal._imageFile);
            }

            const res = await API.post("/api/resume", formData);
            if (res.status >= 200 && res.status < 300) {
                alert("Resume saved successfully!");
                navigate("/");
            } else {
                console.error("Save failed:", res);
                alert("Failed to save resume.");
            }
        } catch (err) {
            console.error("Error saving resume:", err);
            alert("Error saving resume.");
        }
    };

    const handleUpdate = async (id) => {
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            alert("Please fix the highlighted errors before updating.");
            return;
        }

        if (!window.confirm("Are you sure you want to update this CV?")) return;

        try {
            const formData = new FormData();

            // Add all data fields
            formData.append("personal[name]", data.personal.name);
            formData.append("personal[email]", data.personal.email);
            formData.append("personal[phone]", data.personal.phone);
            formData.append("personal[address]", data.personal.address);
            formData.append("personal[city]", data.personal.city);
            formData.append("personal[state]", data.personal.state);
            formData.append("personal[pincode]", data.personal.pincode);
            formData.append("personal[introduction]", data.personal.introduction);

            // Add education
            data.education.forEach((ed, i) => {
                formData.append(`education[${i}][degree]`, ed.degree);
                formData.append(`education[${i}][institution]`, ed.institution);
                formData.append(`education[${i}][percentage]`, ed.percentage);
            });

            // Add experience
            data.experience.forEach((ex, i) => {
                formData.append(`experience[${i}][organization]`, ex.organization);
                formData.append(`experience[${i}][location]`, ex.location);
                formData.append(`experience[${i}][position]`, ex.position);
                formData.append(`experience[${i}][ctc]`, ex.ctc);
                formData.append(`experience[${i}][joiningDate]`, ex.joiningDate);
                formData.append(`experience[${i}][leavingDate]`, ex.leavingDate);
                formData.append(`experience[${i}][technologies]`, ex.technologies);
                formData.append(`experience[${i}][description]`, ex.description);
            });

            // Add projects
            data.projects.forEach((p, i) => {
                formData.append(`projects[${i}][title]`, p.title);
                formData.append(`projects[${i}][teamSize]`, p.teamSize);
                formData.append(`projects[${i}][duration]`, p.duration);
                formData.append(`projects[${i}][technologies]`, p.technologies);
                formData.append(`projects[${i}][description]`, p.description);
            });

            // Add skills
            data.skills.forEach((s, i) => {
                formData.append(`skills[${i}][name]`, s.name);
                formData.append(`skills[${i}][level]`, s.level);
            });

            // Add socials
            data.socials.forEach((so, i) => {
                formData.append(`socials[${i}][platform]`, so.platform);
                formData.append(`socials[${i}][link]`, so.link);
            });

            // Add layout options
            formData.append("layoutOptions[color]", layoutOptions.color);
            formData.append("layoutOptions[font]", layoutOptions.font);
            formData.append("layoutOptions[fontSize]", layoutOptions.fontSize);
            formData.append("layoutChoice", layoutChoice);

            // Handle image: only upload new file if user uploaded one, otherwise keep original
            if (data.personal._imageFile) {
                // User uploaded a new image
                formData.append("image", data.personal._imageFile);
            } else if (originalImagePath && originalImagePath.startsWith('/uploads')) {
                // User didn't upload new image, but there's an original server image
                // Send original path as a field so server knows to keep it
                formData.append("personal[image]", originalImagePath);
            }

            const res = await API.put(`/api/resume/${id}`, formData);
            if (res.status >= 200 && res.status < 300) {
                alert("CV updated successfully!");
                navigate("/");
            } else {
                console.error("Update failed:", res);
                alert("Failed to update CV. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update CV. Please try again.");
        }
    };

    // ---------------------------
    // Styles
    // ---------------------------
    const previewWrapperStyle = {
        fontFamily: layoutOptions.font,
        fontSize: `${layoutOptions.fontSize}px`,
        color: "#333",
    };
    const profileImgStyle = { maxWidth: 150, height: "auto" };

    // ---------------------------
    // JSX
    // ---------------------------
    return (
        <div className="container my-4">
            <div className="row g-4">
                {/* Form */}
                <div className="col-lg-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h3 className="card-title mb-3">Resume Builder</h3>

                            {/* Layout Customization */}
                            <h5>Layout Customization</h5>
                            <div className="row gy-2 align-items-center mb-2">
                                <div className="col-4">
                                    <label className="form-label small">Color</label>
                                    <input
                                        type="color"
                                        name="color"
                                        className="form-control form-control-color"
                                        value={layoutOptions.color}
                                        onChange={handleLayoutChange}
                                    />
                                </div>
                                <div className="col-5">
                                    <label className="form-label small">Font</label>
                                    <select name="font" className="form-select" value={layoutOptions.font} onChange={handleLayoutChange}>
                                        <option>Helvetica</option>
                                        <option>Times-Roman</option>
                                        <option>Courier</option>
                                        <option>Arial</option>
                                    </select>
                                </div>
                                <div className="col-3">
                                    <label className="form-label small">Font Size</label>
                                    <input
                                        type="number"
                                        name="fontSize"
                                        min="8"
                                        max="24"
                                        className="form-control"
                                        value={layoutOptions.fontSize}
                                        onChange={handleLayoutChange}
                                    />
                                </div>
                            </div>

                            <div className="mt-2 mb-3">
                                <label className="form-label">Select Layout</label>
                                <select className="form-select" value={layoutChoice} onChange={(e) => setLayoutChoice(e.target.value)}>
                                    <option value={"Basic"}>Professional CV</option>
                                    <option value={"Formal"}>Entry-Level CV</option>
                                    <option value={"Experience"}>Creative Portfolio CV</option>
                                </select>
                            </div>

                            <hr />

                            {/* Basic Details */}
                            <h5>Basic Details</h5>
                            <div className="mb-2">
                                <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
                                {data.personal.image && (
                                    <img src={data.personal.image} alt="Profile" className="img-thumbnail mt-2" style={profileImgStyle} />
                                )}
                            </div>

                            <div className="mb-2">
                                <input
                                    name="name"
                                    className={`form-control mb-1 ${errors["personal.name"] ? "is-invalid" : ""}`}
                                    placeholder="Full Name"
                                    value={data.personal.name}
                                    onChange={handlePersonalChange}
                                />
                                {errors["personal.name"] && <small className="text-danger">{errors["personal.name"]}</small>}

                                <input
                                    name="email"
                                    className={`form-control mb-1 ${errors["personal.email"] ? "is-invalid" : ""}`}
                                    placeholder="Email"
                                    value={data.personal.email}
                                    onChange={handlePersonalChange}
                                />
                                {errors["personal.email"] && <small className="text-danger">{errors["personal.email"]}</small>}

                                <input
                                    name="phone"
                                    className={`form-control mb-1 ${errors["personal.phone"] ? "is-invalid" : ""}`}
                                    placeholder="Phone"
                                    value={data.personal.phone}
                                    onChange={handlePersonalChange}
                                />
                                {errors["personal.phone"] && <small className="text-danger">{errors["personal.phone"]}</small>}

                                <input
                                    name="address"
                                    className={`form-control mb-1 ${errors["personal.address"] ? "is-invalid" : ""}`}
                                    placeholder="Address"
                                    value={data.personal.address}
                                    onChange={handlePersonalChange}
                                />
                                {errors["personal.address"] && <small className="text-danger">{errors["personal.address"]}</small>}

                                <div className="row g-2">
                                    <div className="col-4">
                                        <input
                                            name="city"
                                            className={`form-control ${errors["personal.city"] ? "is-invalid" : ""}`}
                                            placeholder="City"
                                            value={data.personal.city}
                                            onChange={handlePersonalChange}
                                        />
                                        {errors["personal.city"] && <small className="text-danger">{errors["personal.city"]}</small>}
                                    </div>
                                    <div className="col-4">
                                        <input
                                            name="state"
                                            className={`form-control ${errors["personal.state"] ? "is-invalid" : ""}`}
                                            placeholder="State"
                                            value={data.personal.state}
                                            onChange={handlePersonalChange}
                                        />
                                        {errors["personal.state"] && <small className="text-danger">{errors["personal.state"]}</small>}
                                    </div>
                                    <div className="col-4">
                                        <input
                                            name="pincode"
                                            className={`form-control ${errors["personal.pincode"] ? "is-invalid" : ""}`}
                                            placeholder="Pincode"
                                            value={data.personal.pincode}
                                            onChange={handlePersonalChange}
                                        />
                                        {errors["personal.pincode"] && <small className="text-danger">{errors["personal.pincode"]}</small>}
                                    </div>
                                </div>

                                <textarea
                                    name="introduction"
                                    className={`form-control mt-2 ${errors["personal.introduction"] ? "is-invalid" : ""}`}
                                    placeholder="Introductory Paragraph (validate on blur)"
                                    value={data.personal.introduction}
                                    onChange={handlePersonalChange}
                                    onBlur={() => handleBlur("personal", null, "introduction")}
                                />
                                {errors["personal.introduction"] && <small className="text-danger">{errors["personal.introduction"]}</small>}
                            </div>

                            {/* Education */}
                            <h5 className="mt-3">Education</h5>
                            {data.education.map((ed, i) => (
                                <div className="mb-2" key={i}>
                                    <div className="row g-2">
                                        <div className="col-md-5">
                                            <input
                                                className={`form-control ${errors[`education.${i}.degree`] ? "is-invalid" : ""}`}
                                                placeholder="Degree"
                                                value={ed.degree}
                                                onChange={(e) => handleArrayChange("education", i, "degree", e.target.value)}
                                                onBlur={() => handleBlur("education", i, "degree")}
                                            />
                                            {errors[`education.${i}.degree`] && <small className="text-danger">{errors[`education.${i}.degree`]}</small>}
                                        </div>
                                        <div className="col-md-5">
                                            <input
                                                className={`form-control ${errors[`education.${i}.institution`] ? "is-invalid" : ""}`}
                                                placeholder="Institution"
                                                value={ed.institution}
                                                onChange={(e) => handleArrayChange("education", i, "institution", e.target.value)}
                                                onBlur={() => handleBlur("education", i, "institution")}
                                            />
                                            {errors[`education.${i}.institution`] && <small className="text-danger">{errors[`education.${i}.institution`]}</small>}
                                        </div>
                                        <div className="col-md-2">
                                            <input
                                                className={`form-control ${errors[`education.${i}.percentage`] ? "is-invalid" : ""}`}
                                                placeholder="% / CGPA"
                                                value={ed.percentage}
                                                onChange={(e) => handleArrayChange("education", i, "percentage", e.target.value)}
                                                onBlur={() => handleBlur("education", i, "percentage")}
                                            />
                                            {errors[`education.${i}.percentage`] && <small className="text-danger">{errors[`education.${i}.percentage`]}</small>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-sm btn-outline-primary mb-3" type="button" onClick={() => addArrayItem("education", { degree: "", institution: "", percentage: "" })}>
                                + Add Education
                            </button>

                            {/* Experience */}
                            <h5 className="mt-3">Experience</h5>
                            {data.experience.map((ex, i) => (
                                <div className="mb-3" key={i}>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <input
                                                className={`form-control ${errors[`experience.${i}.organization`] ? "is-invalid" : ""}`}
                                                placeholder="Organization"
                                                value={ex.organization}
                                                onChange={(e) => handleArrayChange("experience", i, "organization", e.target.value)}
                                                onBlur={() => handleBlur("experience", i, "organization")}
                                            />
                                            {errors[`experience.${i}.organization`] && <small className="text-danger">{errors[`experience.${i}.organization`]}</small>}
                                        </div>
                                        <div className="col-md-6">
                                            <input
                                                className="form-control"
                                                placeholder="Location"
                                                value={ex.location}
                                                onChange={(e) => handleArrayChange("experience", i, "location", e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6 ">
                                            <input
                                                className={`form-control ${errors[`experience.${i}.position`] ? "is-invalid" : ""}`}
                                                placeholder="Position"
                                                value={ex.position}
                                                onChange={(e) => handleArrayChange("experience", i, "position", e.target.value)}
                                                onBlur={() => handleBlur("experience", i, "position")}
                                            />
                                            {errors[`experience.${i}.position`] && <small className="text-danger">{errors[`experience.${i}.position`]}</small>}
                                        </div>
                                        <div className="col-md-6">
                                            <input
                                                className={`form-control ${errors[`experience.${i}.ctc`] ? "is-invalid" : ""}`}
                                                placeholder="CTC"
                                                value={ex.ctc}
                                                onChange={(e) => handleArrayChange("experience", i, "ctc", e.target.value)}
                                                onBlur={() => handleBlur("experience", i, "ctc")}
                                            />
                                            {errors[`experience.${i}.ctc`] && <small className="text-danger">{errors[`experience.${i}.ctc`]}</small>}
                                        </div>
                                        <div className="col-md-6">
                                            <input
                                                type="date"
                                                className={`form-control ${errors[`experience.${i}.joiningDate`] ? "is-invalid" : ""}`}
                                                value={ex.joiningDate}
                                                onChange={(e) =>
                                                    handleArrayChange("experience", i, "joiningDate", e.target.value)
                                                }
                                                onBlur={() => handleBlur("experience", i, "joiningDate")}
                                            />
                                            {errors[`experience.${i}.joiningDate`] && (
                                                <small className="text-danger">
                                                    {errors[`experience.${i}.joiningDate`]}
                                                </small>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <input
                                                type="date"
                                                className={`form-control ${errors[`experience.${i}.leavingDate`] ? "is-invalid" : ""}`}
                                                value={ex.leavingDate}
                                                onChange={(e) =>
                                                    handleArrayChange("experience", i, "leavingDate", e.target.value)
                                                }
                                                onBlur={() => handleBlur("experience", i, "leavingDate")}
                                            />
                                            {errors[`experience.${i}.leavingDate`] && (
                                                <small className="text-danger">
                                                    {errors[`experience.${i}.leavingDate`]}
                                                </small>
                                            )}
                                        </div>
                                        <div className="col-12 mt-2">
                                            <input
                                                className="form-control"
                                                placeholder="Technologies Worked On"
                                                value={ex.technologies}
                                                onChange={(e) => handleArrayChange("experience", i, "technologies", e.target.value)}
                                            />
                                        </div>
                                        <div className="col-12 mt-2">
                                            <textarea
                                                className={`form-control ${errors[`experience.${i}.description`] ? "is-invalid" : ""}`}
                                                placeholder="Description (validate on blur)"
                                                value={ex.description}
                                                onChange={(e) => handleArrayChange("experience", i, "description", e.target.value)}
                                                onBlur={() => handleBlur("experience", i, "description")}
                                            />
                                            {errors[`experience.${i}.description`] && <small className="text-danger">{errors[`experience.${i}.description`]}</small>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => addArrayItem("experience", { organization: "", position: "", joiningDate: "", leavingDate: "", technologies: "", description: "" })}>
                                + Add Experience
                            </button>

                            {/* Projects */}
                            <h5 className="mt-3">Projects</h5>
                            {data.projects.map((p, i) => (
                                <div className="mb-2" key={i}>
                                    <input
                                        className={`form-control mb-1 ${errors[`projects.${i}.title`] ? "is-invalid" : ""}`}
                                        placeholder="Project Title"
                                        value={p.title}
                                        onChange={(e) => handleArrayChange("projects", i, "title", e.target.value)}
                                        onBlur={() => handleBlur("projects", i, "title")}
                                    />
                                    {errors[`projects.${i}.title`] && <small className="text-danger">{errors[`projects.${i}.title`]}</small>}
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <input
                                                className="form-control"
                                                placeholder="TeamSize"
                                                value={p.teamSize}
                                                onChange={(e) => handleArrayChange("projects", i, "teamSize", e.target.value)}
                                                onBlur={() => handleBlur("projects", i, "teamSize")}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <input
                                                className="form-control"
                                                placeholder="Duration"
                                                value={p.duration}
                                                onChange={(e) => handleArrayChange("projects", i, "duration", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <input
                                        className="form-control mt-1"
                                        placeholder="Technologies"
                                        value={p.technologies}
                                        onChange={(e) => handleArrayChange("projects", i, "technologies", e.target.value)}
                                    />
                                    <textarea
                                        className="form-control mt-1"
                                        placeholder="Description"
                                        value={p.description}
                                        onChange={(e) => handleArrayChange("projects", i, "description", e.target.value)}
                                    />
                                </div>
                            ))}
                            <button className="btn btn-sm btn-outline-primary mb-3" type="button" onClick={() => addArrayItem("projects", { title: "", teamSize: "", duration: "", technologies: "", description: "" })}>
                                + Add Project
                            </button>

                            {/* Skills */}
                            <h5 className="mt-3">Skills</h5>
                            {data.skills.map((s, i) => (
                                <div className="row g-2 mb-2" key={i}>
                                    <div className="col-8">
                                        <input
                                            className={`form-control ${errors[`skills.${i}.name`] ? "is-invalid" : ""}`}
                                            placeholder="Skill Name"
                                            value={s.name}
                                            onChange={(e) => handleArrayChange("skills", i, "name", e.target.value)}
                                            onBlur={() => handleBlur("skills", i, "name")}
                                        />
                                        {errors[`skills.${i}.name`] && <small className="text-danger">{errors[`skills.${i}.name`]}</small>}
                                    </div>
                                    <div className="col-4">
                                        <input
                                            type="number"
                                            className={`form-control ${errors[`skills.${i}.level`] ? "is-invalid" : ""}`}
                                            placeholder="Proficiency (%)"
                                            value={s.level}
                                            onChange={(e) => handleArrayChange("skills", i, "level", e.target.value)}
                                            onBlur={() => handleBlur("skills", i, "level")}
                                        />
                                        {errors[`skills.${i}.level`] && <small className="text-danger">{errors[`skills.${i}.level`]}</small>}
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-sm btn-outline-primary mb-3" type="button" onClick={() => addArrayItem("skills", { name: "", level: "" })}>
                                + Add Skill
                            </button>

                            {/* Socials */}
                            <h5 className="mt-3">Social Profiles</h5>
                            {data.socials.map((so, i) => (
                                <div className="row g-2 mb-2" key={i}>
                                    <div className="col-5">
                                        <input className="form-control" placeholder="Platform" value={so.platform} onChange={(e) => handleArrayChange("socials", i, "platform", e.target.value)} />
                                    </div>
                                    <div className="col-7">
                                        <input
                                            className={`form-control ${errors[`socials.${i}.link`] ? "is-invalid" : ""}`}
                                            placeholder="Profile Link (https://...)"
                                            value={so.link}
                                            onChange={(e) => handleArrayChange("socials", i, "link", e.target.value)}
                                            onBlur={() => handleBlur("socials", i, "link")}
                                        />
                                        {errors[`socials.${i}.link`] && <small className="text-danger">{errors[`socials.${i}.link`]}</small>}
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-sm btn-outline-primary mb-3" type="button" onClick={() => addArrayItem("socials", { platform: "", link: "" })}>
                                + Add Social
                            </button>

                            {/* Save / Update */}
                            <div className="d-flex gap-2">
                                {newData?._id ? (
                                    <button className="btn btn-success" onClick={() => handleUpdate(newData._id)}>Update Resume</button>
                                ) : (
                                    <button className="btn btn-primary" onClick={handleSaveResume}>💾 Save Resume</button>
                                )}
                                <button className="btn btn-secondary" onClick={() => navigate("/")}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview(sticky) */}
                <div className="col-lg-6">
                    <div
                        className="card shadow-sm"
                        style={{
                            position: "sticky",
                            top: "20px",
                            height: "calc(100vh - 30px)",
                            overflowY: "auto",
                        }}
                    >
                        <div className="card-body">
                            <h5 className="card-title">Preview</h5>

                            <div className="border rounded p-3 mb-3" style={previewWrapperStyle}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h2 style={{ color: layoutOptions.color }}>{data.personal.name}</h2>
                                        <p className="mb-1">{data.personal.email} | {data.personal.phone}</p>
                                        <p className="small text-muted">
                                            {data.personal.address} • {data.personal.city} • {data.personal.state} • {data.personal.pincode}
                                        </p>
                                    </div>
                                    {data.personal.image && (
                                        <img src={data.personal.image} alt="Profile" style={profileImgStyle} className="ms-3" />
                                    )}
                                </div>

                                <hr />
                                <strong style={{ color: layoutOptions.color }}>Summary</strong>
                                <pre className="small">{data.personal.introduction}</pre>

                                <h6 style={{ color: layoutOptions.color }}>Education</h6>
                                {data.education.map((ed, i) => (
                                    <p key={i} className="mb-1">{ed.degree} - {ed.institution} ({ed.percentage})</p>
                                ))}

                                <h6 style={{ color: layoutOptions.color }} className="mt-2">Experience</h6>
                                {data.experience.map((ex, i) => (
                                    <div key={i} className="mb-1">
                                        <div><strong>{ex.position}</strong> at {ex.organization} ({ex.joiningDate} - {ex.leavingDate})</div>
                                        <div className="small">CTC: {ex.ctc} • {ex.location}</div>
                                        <div className="small">Tech: {ex.technologies}</div>
                                        {ex.description && <div className="small">- {ex.description}</div>}
                                    </div>
                                ))}

                                <h6 style={{ color: layoutOptions.color }} className="mt-2">Projects</h6>
                                {data.projects.map((p, i) => (
                                    <div key={i} className="mb-1">
                                        <strong>{p.title}</strong>
                                        <div className="small">TeamSize: {p.teamSize} • Duration: {p.duration}</div>
                                        <div className="small">Tech: {p.technologies}</div>
                                        <div className="small">- {p.description}</div>
                                    </div>
                                ))}

                                <h6 style={{ color: layoutOptions.color }} className="mt-2">Skills</h6>
                                {data.skills.map((s, i) => <p key={i} className="mb-1">{s.name} - {s.level}%</p>)}

                                <h6 style={{ color: layoutOptions.color }} className="mt-2">Social Media</h6>
                                {data.socials.map((s, i) => <p key={i} className="mb-1">{s.platform} - {s.link}</p>)}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
