/* ============================================
   LittleFriends - Email Service Module
   Handles form submission via Google Forms
   + auto-reply acknowledgment via EmailJS
   ============================================ */

const EmailService = (() => {

  // ── Google Forms Config ─────────────────────────────────────────
  const GOOGLE_FORM = {
    actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdkwSX8KcIFMCxkYs7cb9LhK7v2DyfpHdXXLZaTvAO3lq7gpg/formResponse',
    fields: {
      name:    'entry.436882717',
      phone:   'entry.549153433',
      email:   'entry.274874504',
      message: 'entry.733982086',
    },
  };

  // ── EmailJS Config (for auto-reply only) ────────────────────────
  const EMAILJS = {
    publicKey:   '0i1uEePctfzXA4_ZW',
    serviceId:   'service_2my0m4l',
    templateId:  'template_l85hhi9',
  };

  // ── School Logo URL (used inside auto-reply email) ──────────────
  const LOGO_URL = 'https://littlefriendspreschool.com/assets/song/little_friends_logo.png';

  // ── Auto-reply message template (edit text here) ────────────────
  const AUTO_REPLY = {
    subject: () =>
      'Thank You for Contacting Little Friends Preschool and Day Care! 🌟',

    body: (data) => `
      <div style="font-family:'Nunito',Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#FF6B6B,#FFD93D);padding:24px;text-align:center">
          <img src="${LOGO_URL}" alt="Little Friends Logo" width="70" height="70"
               style="border-radius:50%;background:#fff;padding:5px">
          <h2 style="color:#fff;margin:12px 0 4px">Little Friends Preschool and Day Care</h2>
          <p style="color:#fff;margin:0;font-size:14px">Where Little Minds Grow Big Dreams ✨</p>
        </div>
        <div style="padding:28px">
          <p style="font-size:16px;color:#333">Dear <strong>${data.name}</strong>,</p>
          <p style="font-size:15px;color:#444;line-height:1.7">
            Thank you so much for reaching out to <strong>Little Friends Preschool and Day Care</strong>!
            We truly appreciate your interest and are delighted that you are considering us for your child's
            early learning journey.
          </p>
          <p style="font-size:15px;color:#444;line-height:1.7">
            We have received your enquiry and our team will review it promptly.
            We will get back to you within <strong>24 hours</strong> with all the information you need.
          </p>
          <p style="font-size:15px;color:#444;line-height:1.7">
            In the meantime, feel free to reach us at
            <strong>+91 89020 98125</strong> or visit our campus in Newtown, Kolkata.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
          <p style="font-size:15px;color:#333;margin-bottom:4px">Warm Regards,</p>
          <p style="font-size:16px;color:#FF6B6B;font-weight:700;margin:4px 0">Mrs. Priyanka Verma</p>
          <p style="font-size:13px;color:#777;margin:0">Founder &amp; Principal</p>
          <p style="font-size:13px;color:#777;margin:2px 0">Little Friends Preschool and Day Care</p>
        </div>
        <div style="background:#f9f9f9;padding:16px;text-align:center;font-size:12px;color:#999">
          This is an automated response. Please do not reply to this email.<br>
          &copy; 2026 Little Friends Preschool and Day Care. All rights reserved.
        </div>
      </div>`,
  };

  // ── Initialise EmailJS SDK ──────────────────────────────────────
  function init() {
    if (typeof emailjs !== 'undefined') {
      emailjs.init(EMAILJS.publicKey);
    }
  }

  // ── Submit to Google Forms (saves enquiry to spreadsheet) ───────
  function submitToGoogleForm(data) {
    const formData = new URLSearchParams();
    formData.append(GOOGLE_FORM.fields.name,    data.name);
    formData.append(GOOGLE_FORM.fields.phone,   data.phone);
    formData.append(GOOGLE_FORM.fields.email,   data.email);
    formData.append(GOOGLE_FORM.fields.message,  data.message);

    return fetch(GOOGLE_FORM.actionUrl, {
      method: 'POST',
      mode:   'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
  }

  // ── Send auto-reply acknowledgment via EmailJS ──────────────────
  function sendAutoReply(data) {
    if (typeof emailjs === 'undefined') return Promise.resolve();

    return emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, {
      to_email:     data.email,
      subject:      AUTO_REPLY.subject(data),
      message_html: AUTO_REPLY.body(data),
    });
  }

  // ── Main: submit form + send auto-reply ─────────────────────────
  function sendEnquiry(formData) {
    const data = {
      name:    formData.name.trim(),
      phone:   formData.phone.trim(),
      email:   formData.email.trim(),
      message: formData.message.trim(),
    };

    return Promise.all([
      submitToGoogleForm(data),
      sendAutoReply(data),
    ]);
  }

  // ── Public API ──────────────────────────────────────────────────
  return { init, sendEnquiry, AUTO_REPLY };

})();
