const Resume = require("../models/Resume.model");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

// ================= CREATE RESUME =================
exports.createResume = async (req, res) => {
  try {
    const { body, file, user } = req;

    const newResume = new Resume({
      ...body,
      personal: {
        ...body.personal,
        image: file ? `/uploads/resumes/${file.filename}` : null
      },
      userId: user.id,
    });

    await newResume.save();

    res.status(201).json({
      status: "success",
      message: "Resume created successfully",
      resume: newResume
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


// ================= GET ALL RESUMES (PAGINATED) =================
exports.getAllResumes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const resumes = await Resume.find({ userId: req.user.id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalDocs = await Resume.countDocuments({ userId: req.user.id });

    res.status(200).json({
      status: "success",
      page,
      limit,
      totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
      hasMore: page * limit < totalDocs,
      resumes
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


// ================= GET RESUME BY ID =================
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        status: "fail",
        message: "Resume not found"
      });
    }

    res.status(200).json({
      status: "success",
      resume
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


// ================= UPDATE RESUME =================
exports.updateResume = async (req, res) => {
  try {
    let updateData = req.body;

    if (req.file) {
      updateData.personal = {
        ...updateData.personal,
        image: `/uploads/resumes/${req.file.filename}`
      };
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({
        status: "fail",
        message: "Resume not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Resume updated successfully",
      resume
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


// ================= DELETE RESUME =================
exports.deleteResume = async (req, res) => {
  try {
    const result = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!result) {
      return res.status(404).json({
        status: "fail",
        message: "Resume not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Resume deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

exports.downloadResumePDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ status: 'fail', message: 'Resume not found' });

    // Set headers to force download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.personal?.name || 'resume'}.pdf"`);

    const doc = new PDFDocument({ margin: 30 });

    // Pipe PDF to response
    doc.pipe(res);

    // Use layoutOptions
    const mainColor = resume.layoutOptions?.color || "#000000";
    const mainFontSize = resume.layoutOptions?.fontSize || 12;

    // ---- Image Block ----
    if (resume.personal?.image) {
      try {
        const imagePath = path.join(process.cwd(), resume.personal.image);
        console.log("Loading image from:", imagePath);
        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, {
            fit: [100, 100],
            align: 'left',
            valign: 'top'
          });

          doc.moveDown(2);
        }
      } catch (imgErr) {
        console.error("Image load error:", imgErr);
      }
    }

    // ---------------- Header ----------------
    doc.fillColor(mainColor)
      .fontSize(20)
      .text(resume.personal?.name || "Name", { underline: true });
    doc.moveDown();

    // Contact info
    doc.fillColor("#000")
      .fontSize(mainFontSize)
      .text(`${resume.personal?.email || ""} · ${resume.personal?.phone || ""}`);
    doc.text(`${resume.personal?.city || ""}, ${resume.personal?.state || ""}`);
    doc.moveDown();

    // Introduction
    if (resume.personal?.introduction) {
      doc.fontSize(mainFontSize)
        .text(resume.personal.introduction);
      doc.moveDown();
    }

    // ---------------- Education ----------------
    if (resume.education?.length > 0) {
      doc.fillColor(mainColor)
        .fontSize(mainFontSize + 2)
        .text("Education:", { underline: true });
      resume.education.forEach(e => {
        doc.fillColor("#000")
          .fontSize(mainFontSize)
          .text(`${e.degree}, ${e.institution} (${e.percentage})`);
      });
      doc.moveDown();
    }

    // ---------------- Experience ----------------
    if (resume.experience?.length > 0) {
      doc.fillColor(mainColor)
        .fontSize(mainFontSize + 2)
        .text("Experience:", { underline: true });
      resume.experience.forEach(exp => {
        doc.fillColor("#000")
          .fontSize(mainFontSize)
          .text(`${exp.position} at ${exp.organization} (${exp.joiningDate} - ${exp.leavingDate})`);
        if (exp.description) doc.text(`  • ${exp.description}`);
      });
      doc.moveDown();
    }

    // ---------------- Projects ----------------
    if (resume.projects?.length > 0) {
      doc.fillColor(mainColor)
        .fontSize(mainFontSize + 2)
        .text("Projects:", { underline: true });
      resume.projects.forEach(proj => {
        doc.fillColor("#000")
          .fontSize(mainFontSize)
          .text(`${proj.title} (${proj.duration}, Team: ${proj.teamSize})`);
        if (proj.description) doc.text(`  • ${proj.description}`);
      });
      doc.moveDown();
    }

    // ---------------- Skills ----------------
    if (resume.skills?.length > 0) {
      doc.fillColor(mainColor)
        .fontSize(mainFontSize + 2)
        .text("Skills:", { underline: true });
      doc.fillColor("#000")
        .fontSize(mainFontSize)
        .text(resume.skills.map(s => s.name).join(", "));
      doc.moveDown();
    }

    // ---------------- Socials ----------------
    if (resume.socials?.length > 0) {
      doc.fillColor(mainColor)
        .fontSize(mainFontSize + 2)
        .text("Socials:", { underline: true });
      resume.socials.forEach(s => {
        doc.fillColor("#000")
          .fontSize(mainFontSize)
          .text(`${s.platform}: ${s.link}`);
      });
      doc.moveDown();
    }

    // Finalize PDF
    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
  }
};


// ================= GET SHARED RESUME (PUBLIC) =================
exports.getSharedResume = async (req, res) => {
  try {
    const { shareToken } = req.params;

    const resume = await Resume.findOne({
      shareToken: shareToken,
      isShared: true
    });

    if (!resume) {
      return res.status(404).json({
        status: "fail",
        message: "Shared CV not found or has been removed"
      });
    }

    res.status(200).json({
      status: "success",
      resume
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};
