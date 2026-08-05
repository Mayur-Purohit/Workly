(function(window) {
  'use strict';

  var API_BASE = 'http://127.0.0.1:8000/api';

  var WorklySDK = {
    init: function(config) {
      if (!config || !config.token) {
        console.error('[Workly Embed] Error: token is required in Workly.init()');
        return;
      }
      
      var containerEl = document.querySelector(config.container || '#workly-panel');
      if (!containerEl) {
        console.error('[Workly Embed] Error: container element not found:', config.container);
        return;
      }

      // Show loading state
      containerEl.innerHTML = '<div style="font-family: system-ui, sans-serif; padding: 24px; text-align: center; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; font-weight: 600;">🔄 Validating Workly Embed Token...</div>';

      // Validate token with backend
      fetch(API_BASE + '/developer/embed/validate', {
        method: 'GET',
        headers: {
          'X-Embed-Token': config.token,
          'Origin': window.location.origin
        }
      })
      .then(function(res) { return res.json(); })
      .then(function(resData) {
        if (!resData.success || !resData.data.valid) {
          containerEl.innerHTML = '<div style="font-family: system-ui, sans-serif; padding: 24px; text-align: center; color: #ef4444; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 16px; font-weight: bold;">⚠️ Workly Embed Authorization Failed: ' + (resData.error || 'Invalid or revoked token') + '</div>';
          return;
        }

        var jwt = resData.data.jwt;
        var perms = resData.data.permissions || [];

        // Render Widget Card
        containerEl.innerHTML = `
          <div style="font-family: 'Google Sans Text', system-ui, -apple-system, sans-serif; max-width: 520px; background: #ffffff; border: 1.5px solid #e5e7eb; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); overflow: hidden; margin: 20px auto; text-align: left;">
            <div style="background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%); padding: 20px 24px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Powered by Workly AI</div>
                <div style="font-size: 18px; font-weight: 800; margin-top: 2px;">Candidate AI Screener</div>
              </div>
              <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700;">Verified Token</span>
            </div>
            <div style="padding: 24px; text-align: center;">
              <p style="color: #4b5563; font-size: 14px; margin: 0 0 20px; line-height: 1.5;">
                Drop candidate resume below for instant AI Parsing, Skill Extraction, and Match Scoring.
              </p>
              
              <div style="border: 2px dashed #cbd5e1; background: #f8fafc; border-radius: 16px; padding: 28px 16px; cursor: pointer; transition: all 0.2s;" id="workly-dropzone">
                <div style="font-size: 32px; margin-bottom: 8px;">📄</div>
                <div style="font-size: 14px; font-weight: 700; color: #1e293b;">Click or drag candidate resume here</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Supports PDF, DOCX, TXT (Max 10MB)</div>
                <input type="file" id="workly-file-input" accept=".pdf,.docx,.txt" style="display: none;" />
              </div>

              <div id="workly-result-box" style="margin-top: 16px; text-align: left; display: none;"></div>
            </div>
            <div style="background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 12px 24px; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 600;">
              Authorized for <strong>` + window.location.hostname + `</strong> • Permissions: ` + perms.join(', ') + `
            </div>
          </div>
        `;

        // Wire drag & drop and file upload logic
        var dropzone = document.getElementById('workly-dropzone');
        var fileInput = document.getElementById('workly-file-input');
        var resultBox = document.getElementById('workly-result-box');

        if (dropzone && fileInput) {
          dropzone.addEventListener('click', function() { fileInput.click(); });
          
          fileInput.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;

            dropzone.style.display = 'none';
            resultBox.style.display = 'block';
            resultBox.innerHTML = '<div style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 16px; border-radius: 12px; font-size: 13px; font-weight: 600; text-align: center;">⚡ Processing ' + file.name + ' with Workly AI Parsing Agent...</div>';

            var formData = new FormData();
            formData.append('file', file);

            fetch(API_BASE + '/developer/embed/parse', {
              method: 'POST',
              headers: {
                'X-Embed-Token': config.token
              },
              body: formData
            })
            .then(function(parseRes) { return parseRes.json(); })
            .then(function(parseData) {
              if (!parseData.success) {
                resultBox.innerHTML = '<div style="background: #fef2f2; border: 1px solid #fca5a5; color: #ef4444; padding: 16px; border-radius: 12px; font-size: 13px;">❌ Parsing Failed: ' + (parseData.error || 'Unknown error') + '</div>';
                return;
              }

              var d = parseData.data;
              var skillBadges = (d.skills || []).map(function(s) {
                return '<span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-right: 4px; display: inline-block; margin-top: 4px;">' + s + '</span>';
              }).join('');

              resultBox.innerHTML = '<div style="background: #f0fdf4; border: 1.5px solid #86efac; color: #166534; padding: 18px; border-radius: 16px; font-size: 13px;">' +
                '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
                  '<div style="font-weight: 800; font-size: 15px; color: #14532d;">✅ Candidate Parsed & Ingested</div>' +
                '</div>' +
                '<div style="margin-bottom: 6px;"><strong>Candidate:</strong> ' + d.candidate_name + '</div>' +
                '<div style="margin-bottom: 8px;"><strong>Detected Skills:</strong><br />' + skillBadges + '</div>' +
                '<div style="font-size: 11px; color: #15803d; border-top: 1px dashed #bbf7d0; pt-2; margin-top: 8px;"><strong>Status:</strong> Synchronized & Stored in Workly DB</div>' +
              '</div>';
            })
            .catch(function(err) {
              resultBox.innerHTML = '<div style="background: #fef2f2; border: 1px solid #fca5a5; color: #ef4444; padding: 16px; border-radius: 12px; font-size: 13px;">❌ Upload error: ' + err.message + '</div>';
            });
          });
        }
      })
      .catch(function(err) {
        containerEl.innerHTML = '<div style="font-family: system-ui, sans-serif; padding: 20px; color: #ef4444; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 12px;">⚠️ Network error validating embed token</div>';
      });
    }
  };

  window.Workly = WorklySDK;
})(window);
