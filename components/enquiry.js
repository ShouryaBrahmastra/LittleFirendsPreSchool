document.querySelector('[data-component="enquiry"]').outerHTML = `
<!-- ============== ENQUIRY SECTION ============== -->
<section class="enquiry-section parallax-section" id="enquiry">
  <!-- Parallax Decorations -->
  <div class="parallax-decor parallax-blob parallax-md parallax-secondary pd-1" data-parallax-depth="3"></div>
  <div class="parallax-decor parallax-circle parallax-lg parallax-pink pd-2" data-parallax-depth="4" data-parallax-x="true"></div>
  <div class="parallax-decor parallax-ring parallax-md parallax-yellow pd-3" data-parallax-depth="2"></div>
  <div class="parallax-decor parallax-star pd-4" data-parallax-depth="5">✉️</div>

  <div class="section-title reveal">
    <h2>📝 Get In Touch</h2>
    <p>We'd love to hear from you! Fill out the form and our team will reach out shortly.</p>
  </div>
  <div class="enquiry-container">
    <!-- Info Side -->
    <div class="enquiry-info reveal-left">
      <h2>Let's Start Your Child's <span class="highlight">Journey</span> Together!</h2>
      <p class="enquiry-description">
        Have questions about admissions, programs, or our approach? We're here to help!
        Reach out and let's discuss how Little Friends Preschool and Day Care can be the perfect start for your little one.
      </p>
      <div class="enquiry-contact-list">
        <div class="enquiry-contact-item">
          <div class="enquiry-contact-icon">
            <a href="https://maps.app.goo.gl/2qVwQsaM91Tx7XYGA" target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps" style="color: inherit; text-decoration: none;">
              <span class="material-icons">location_on</span>
            </a>
          </div>
          <div class="enquiry-contact-text">
            <h4>Visit Us</h4>
            <p>DD 69, Street 273, Action Area 1, Besides The Newtown School (IndusInd Bank ATM), Newtown, Kolkata, India, 700156</p>
          </div>
        </div>
        <div class="enquiry-contact-item">
          <div class="enquiry-contact-icon">
            <span class="material-icons">phone</span>
          </div>
          <div class="enquiry-contact-text">
            <h4>Call Us</h4>
            <p>+91 89020 98125</p>
          </div>
        </div>
        <div class="enquiry-contact-item">
          <div class="enquiry-contact-icon">
            <span class="material-icons">email</span>
          </div>
          <div class="enquiry-contact-text">
            <h4>Email Us</h4>
            <p>littlefriends.psdc@gmail.com</p>
          </div>
        </div>
        <div class="enquiry-contact-item">
          <div class="enquiry-contact-icon">
            <span class="material-icons">schedule</span>
          </div>
          <div class="enquiry-contact-text">
            <h4>Working Hours</h4>
            <p>Mon – Sat, 8:30 AM – 8:00 PM</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Side -->
    <div class="enquiry-form-wrapper reveal-right">
      <h3 class="enquiry-form-title">✍️ Send Us a Message</h3>
      <form id="enquiry-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="form-name">Full Name</label>
          <input class="form-input" type="text" id="form-name" name="name" placeholder="Enter your name" required autocomplete="name">
          <div class="form-input-icon"><span class="material-icons">person</span></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="form-phone">Phone Number</label>
          <input class="form-input" type="tel" id="form-phone" name="phone" placeholder="Enter your phone number" required autocomplete="tel">
          <div class="form-input-icon"><span class="material-icons">phone</span></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="form-email">Email Address</label>
          <input class="form-input" type="email" id="form-email" name="email" placeholder="Enter your email" required autocomplete="email">
          <div class="form-input-icon"><span class="material-icons">mail</span></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="form-message">Message</label>
          <textarea class="form-textarea" id="form-message" name="message" placeholder="Tell us about your enquiry..." rows="4" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary form-submit">
          <span class="material-icons">send</span> Send Enquiry
        </button>
        <p class="form-note">🔒 Your information is safe and will not be shared.</p>
      </form>
      <div class="form-success">
        <div class="form-success-icon">🎉</div>
        <h3>Thank You!</h3>
        <p>Your enquiry has been received. We'll get back to you within 24 hours!</p>
      </div>
    </div>
  </div>
</section>
`;
