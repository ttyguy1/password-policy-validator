var Password_Policy_Validator = (function()
{

  // Visible Interface
  var visible = {};

  // Private Variables
  var _password_input;
  var _password_policy;
  var _check_svg;
  var _times_svg;
  var _requirement_popup;

  //****************************************
  // Initialize
  //****************************************

  visible.Initialize = function(options)
  {
    _password_input = document.querySelector(options.input) || false;
    _password_policy = options.policy || false;

    _check_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"/></svg>';
    _times_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/></svg>';

    if(_password_input && _password_policy)
    {
      Add_Password_Input_Pattern();
      Watch_For_Password_Input_Focus();
    }
  }

  //****************************************
  // Add password input pattern for validation
  // Hat tip: https://www.rexegg.com/regex-lookarounds.html
  //****************************************

  var Add_Password_Input_Pattern = function()
  {
    var pattern = '^';

    if(_password_policy.minimum_alphabetic > 0)
    {
      pattern += '(?=(?:[^A-Za-z]*[A-Za-z]){' + _password_policy.minimum_alphabetic + '})';
    }

    if(_password_policy.minimum_uppercase > 0)
    {
      pattern += '(?=(?:[^A-Z]*[A-Z]){' + _password_policy.minimum_uppercase + '})';
    }

    if(_password_policy.minimum_lowercase > 0)
    {
      pattern += '(?=(?:[^a-z]*[a-z]){' + _password_policy.minimum_lowercase + '})';
    }

    if(_password_policy.minimum_numeric > 0)
    {
      pattern += '(?=(?:[^0-9]*[0-9]){' + _password_policy.minimum_numeric + '})';
    }

    if(_password_policy.minimum_symbolic > 0)
    {
      pattern += '(?=(?:[^!@#$%^&*()/*-+=_?,. ]*[!@#$%^&*()/*-+=_?,. ]){' + _password_policy.minimum_symbolic + '})';
    }

    if(_password_policy.minimum_length > 0)
    {
      pattern += '.{' + _password_policy.minimum_length + ',}';
    }

    _password_input.pattern = pattern;
  }

  //****************************************
  // Watch for password input focus
  //****************************************

  var Watch_For_Password_Input_Focus = function()
  {
    _password_input.addEventListener('focus', function()
    {
      Create_Requirement_Popup();
      Validate_Requirements(this.value);

      // Display requirement popup
      _requirement_popup.classList.remove('hidden');

      Adjust_Popup_Position();
    });

    _password_input.addEventListener('keyup', function()
    {
      Validate_Requirements(this.value);
    });

    _password_input.addEventListener('blur', function()
    {
      // Hide requirement popup
      _requirement_popup.classList.add('hidden');
    });
  }

  //****************************************
  // Create requirement popup
  //****************************************

  var Create_Requirement_Popup = function()
  {
    // Only create the popup once
    if(!_requirement_popup)
    {
      // Add wrapper around password field
      var wrapper = document.createElement('div');
      wrapper.className = 'password-wrapper';
      _password_input.parentNode.insertBefore(wrapper, _password_input);
      wrapper.appendChild(_password_input);

      _requirement_popup = document.createElement('div');
      _requirement_popup.className = 'password-policy';

      var title = document.createElement('p');
      title.className = 'title';
      title.innerHTML = 'Password Policy:';
      _requirement_popup.appendChild(title);

      if(_password_policy.minimum_length > 0)
      {
        _requirement_popup.appendChild(Create_Checklist(_password_policy.minimum_length + ' characters minimum', 'req_1'));
      }

      if(_password_policy.minimum_alphabetic > 0)
      {
        _requirement_popup.appendChild(Create_Checklist(_password_policy.minimum_alphabetic + ' alphabetic character' + ((_password_policy.minimum_alphabetic === 1) ? '' : 's') + ' minimum', 'req_2'));
      }

      if(_password_policy.minimum_lowercase > 0)
      {
        _requirement_popup.appendChild(Create_Checklist(_password_policy.minimum_lowercase + ' lowercase alphabetic character' + ((_password_policy.minimum_lowercase === 1) ? '' : 's'), 'req_3'));
      }

      if(_password_policy.minimum_uppercase > 0)
      {
        _requirement_popup.appendChild(Create_Checklist(_password_policy.minimum_uppercase + ' uppercase alphabetic character' + ((_password_policy.minimum_uppercase === 1) ? '' : 's'), 'req_4'));
      }

      if(_password_policy.minimum_numeric > 0)
      {
        _requirement_popup.appendChild(Create_Checklist(_password_policy.minimum_numeric + ' numeric character' + ((_password_policy.minimum_numeric === 1) ? '' : 's'), 'req_5'));
      }

      if(_password_policy.minimum_symbolic > 0)
      {
        _requirement_popup.appendChild(Create_Checklist(_password_policy.minimum_symbolic + ' symbolic character' + ((_password_policy.minimum_symbolic === 1) ? '' : 's'), 'req_6'));
      }

      // Add requirement popup to wrapper
      wrapper.appendChild(_requirement_popup);

      // Reset focus
      // Setting a timeout was the only way I was able to get the focus to work properly
      setTimeout(function()
      {
        _password_input.focus();
      }, 1);
    }
  }

  //****************************************
  // Create checklist
  //****************************************

  var Create_Checklist = function(name, id)
  {
    // Create wrapper
    var req_wrapper = document.createElement('div');
    req_wrapper.className = 'req';
    req_wrapper.id = id;

    // Create checkbox
    var req_checkbox = document.createElement('div');
    req_checkbox.className = 'checkbox';
    req_checkbox.innerHTML = _times_svg;
    req_wrapper.appendChild(req_checkbox);

    // Create title
    var req_title = document.createElement('p');
    req_title.innerHTML = name;
    req_wrapper.appendChild(req_title);

    return req_wrapper;
  }

  //****************************************
  // Adjust position
  //****************************************

  var Adjust_Popup_Position = function()
  {
    // Remove previous alignment
    _requirement_popup.classList.remove('bottom-align');

    // Acquire popup position/dimensions
    var clientRect = _requirement_popup.getBoundingClientRect();
    var top = clientRect.bottom + window.pageYOffset;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;

    // Place the popup above the input if it overflows the page
    if(top > (viewportHeight + scrollTop))
    {
      _requirement_popup.classList.add('bottom-align');
    }
    else
    {
      _requirement_popup.classList.remove('bottom-align');
    }
  }

  //****************************************
  // Validate requirements
  //****************************************

  var Validate_Requirements = function(password)
  {
    Set_Checkbox('req_1', (password.length >= _password_policy.minimum_length));
    Set_Checkbox('req_2', ((password.match(/[A-Za-z]/g) || []).length >= _password_policy.minimum_alphabetic));
    Set_Checkbox('req_3', ((password.match(/[a-z]/g) || []).length >= _password_policy.minimum_lowercase));
    Set_Checkbox('req_4', ((password.match(/[A-Z]/g) || []).length >= _password_policy.minimum_uppercase));
    Set_Checkbox('req_5', ((password.match(/[0-9]/g) || []).length >= _password_policy.minimum_numeric));
    Set_Checkbox('req_6', ((password.match(/[!@#$%^&*()/*-+=_?,. ]/g) || []).length >= _password_policy.minimum_symbolic));
  }

  //****************************************
  // Set checkbox
  //****************************************

  var Set_Checkbox = function(id, display)
  {
    var this_checkbox = document.querySelector('#' + id + ' .checkbox') || false;

    if(this_checkbox)
    {
      if(display)
      {
        this_checkbox.classList.add('on');
        this_checkbox.innerHTML = _check_svg;
      }
      else
      {
        this_checkbox.classList.remove('on');
        this_checkbox.innerHTML = _times_svg;
      }
    }
  }

  // Return public interface
  return visible;

});
