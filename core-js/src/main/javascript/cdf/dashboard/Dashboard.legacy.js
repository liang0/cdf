/*!
 * Copyright 2002 - 2016 Webdetails, a Pentaho company. All rights reserved.
 *
 * This software was developed by Webdetails and is provided under the terms
 * of the Mozilla Public License, Version 2.0, or any later version. You may not use
 * this file except in compliance with the license. If you need a copy of the license,
 * please go to http://mozilla.org/MPL/2.0/. The Initial Developer is Webdetails.
 *
 * Software distributed under the Mozilla Public License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. Please refer to
 * the license for the specific language governing your rights and limitations.
 */

define([
  '../queries/CdaQuery.ext',
  '../components/XactionComponent.ext',
  './Dashboard.ext',
  './Dashboard',
  '../Logger',
  '../lib/jquery',
  'css!./Dashboard.legacy.css'
], function(CdaQueryExt, XactionComponentExt, DashboardExt, Dashboard, Logger, $) {

  /**
   * @class cdf.dashboard.Dashboard.legacy
   * @amd cdf/dashboard/Dashboard.legacy
   * @classdesc A class representing an extension to the Dashboard class for handling legacy calls.
   *            The methods here handle calling xactions and other legacy related actions.
   *            All the methods in this class are deprecated.
   * @deprecated
   * @ignore
   */
  Dashboard.implement(/** @lends cdf.dashboard.Dashboard# */{

    /**
     * Calls a xaction.
     *
     * @param {Object} obj        DOM object where the response from the xaction should be written.
     * @param {string} solution   The solution folder.
     * @param {string} path       Path to the xaction. Can be the full path, in which case you don't need the solution and action.
     * @param {string} action     The xaction name.
     * @param {Object} parameters Parameter object to send to the xaction.
     * @param {function} callback Callback function to call when the xaction responds.
     * @return {*} The xaction result.
     *
     * @deprecated
     */
    callPentahoAction: function(obj, solution, path, action, parameters, callback) {
      var myself = this;
    
      // Encapsulate pentahoAction call
      // Dashboards.log("Calling pentahoAction for " + obj.type + " " + obj.name + "; Is it visible?: " + obj.visible);
      if(typeof callback == 'function') {
        return myself.pentahoAction(solution, path, action, parameters, function(json) {
          callback(myself.parseXActionResult(obj, json));
        });
      } else {
        return myself.parseXActionResult(obj, myself.pentahoAction(solution, path, action, parameters, callback));
      }
    },

    /**
     * Calls an arbitrary URL expecting the result content type to be xml.
     *
     * @param {string} url    The URL to call.
     * @param {Object} params The parameters object.
     * @param {function} func Callback function.
     * @return {*} The parsed invocation result if no callback was supplied. Otherwise, null.
     *
     * @deprecated
     */
    urlAction: function(url, params, func) {
      return this.executeAjax('xml', url, params, func);
    },

    /**
     * Executes an Ajax request. If no `func` callback is provided it executes asynchronously
     * and returns a jQuery XMLHttpRequest ({@link http://api.jquery.com/jQuery.ajax/#jqXHR|jqXHR})
     * object. Otherwise, it executes {@link http://api.jquery.com/jquery.ajax/|jQuery.ajax} synchronously and
     * returns the result of the HTTP request.
     *
     * @param {string}   returnType The expected return type.
     * @param {string}   url        The URL to call.
     * @param {Object}   params     The parameters object.
     * @param {function} func       Callback function.
     * @return {*} If no `func` callback is provided it returns a jqXHR object.
     *             Otherwise, it returns the result of the HTTP request.
     *
     * @deprecated
     */
    executeAjax: function(returnType, url, params, func) {
      var myself = this;
      // execute a url
      if(typeof func == "function") {
        // async
        return $.ajax({
          url: url,
          type: "POST",
          traditional: true,
          dataType: returnType,
          async: true,
          data: params,
          complete: function(XMLHttpRequest, textStatus) {
            /* CDF-271 jQuery 1.9.1 bug #13388 */
            if(typeof XMLHttpRequest.responseXML == "undefined") {
              func($.parseXML(XMLHttpRequest.responseText));
            } else {
              func(XMLHttpRequest.responseXML);
            }
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {
            Logger.error("Found error: " + XMLHttpRequest + " - " + textStatus + ", Error: " + errorThrown);
          }
        });
      }
    
      // Sync
      var result = $.ajax({
        url: url,
        type: "POST",
        dataType: returnType,
        async: false,
        data: params,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          Logger.error("Found error: " + XMLHttpRequest + " - " + textStatus + ", Error: " + errorThrown);
        }
      });

      if(returnType == 'xml') {
        /* CDF-271 jQuery 1.9.1 bug #13388 */
        if(typeof result.responseXML == "undefined") {
          return $.parseXML(result.responseText);
        } else {
          return result.responseXML;
        }
      } else {
        return result.responseText;
      }
    },

    /**
     * Another way to call an xaction.
     *
     * @param {string}   solution Solution folder.
     * @param {string}   path     Path to the xaction. Can be the full path, in which case you don't need the solution and action.
     * @param {string}   action   The xaction name.
     * @param {Object}   params   Parameter object to send to the xaction.
     * @param {function} func     Callback function to call when the xaction responds.
     * @return {*} The xaction result.
     *
     * @deprecated
     */
    pentahoAction: function(solution, path, action, params, func) {
      return this.pentahoServiceAction('ServiceAction', 'xml', solution, path, action, params, func);
    },

    /**
     * Calls an xaction.
     *
     * @param {string}   serviceMethod Dom object where the response from the xaction should be written.
     * @param {string}   returntype    Expected return type of the response.
     * @param {string}   solution      Solution folder.
     * @param {string}   path          Path to the xaction. Can be the full path, in which case you don't need the solution and action
     * @param {string}   action        The xaction name.
     * @param {Object}   params        Parameter object to send to the xaction.
     * @param {function} func          Callback function to call when the xaction responds.
     * @return {*} The xaction result.
     *
     * @deprecated
     */
    pentahoServiceAction: function(serviceMethod, returntype, solution, path, action, params, func) {
      // execute an Action Sequence on the server
    
      var arr = DashboardExt.getServiceAction(serviceMethod, solution, path, action);
      var url = arr.url;
      delete arr.url;
    
      $.each(params,function(i, val) {
        arr[val[0]] = val[1];
      });
      return this.executeAjax(returntype, url, arr, func);
    },

    /**
     * Legacy identifier of the HTML div element used for showing errors.
     *
     * @type {string}
     * @default
     *
     * @deprecated
     */
    CDF_ERROR_DIV: 'cdfErrorDiv',

    /**
     * Creates an empty HTML div element, with identifier
     * {@link cdf.dashboard.Dashboard#CDF_ERROR_DIV|CDF_ERROR_DIV} for showing error messages.
     *
     * @deprecated
     */
    createAndCleanErrorDiv: function() {
      if($("#" + this.CDF_ERROR_DIV).length == 0) {
        $("body").append("<div id='" + this.CDF_ERROR_DIV + "'></div>");
      }
      $("#" + this.CDF_ERROR_DIV).empty();
    },

    /**
     * Creates an empty HTML div element for showing error messages.
     *
     * @deprecated
     */
    showErrorTooltip: function() {
      $(function() {
        if($.tooltip) {
          $(".cdf_error").tooltip({
            delay: 0,
            track: true,
            fade: 250,
            showBody: " -- "
          });
        }
      });
    },

    /**
     * Parses the xaction result.
     *
     * @private
     * @param {Object} obj  DOM object where the response will be written to.
     * @param {string} html HTML string containing the xaction result.
     *
     * @deprecated
     */
    parseXActionResult: function(obj, html) {
    
      var jXML = $(html);
      var error = jXML.find("SOAP-ENV\\:Fault");
      if(error.length == 0) {
        return jXML;
      }
    
      // error found. Parsing it
      var errorMessage = "Error executing component " + obj.name;
      var errorDetails = new Array();
      errorDetails[0] = " Error details for component execution " + obj.name + " -- ";
      errorDetails[1] = error.find("SOAP-ENV\\:faultstring").find("SOAP-ENV\\:Text:eq(0)").text();
      error.find("SOAP-ENV\\:Detail").find("message").each(function() {
        errorDetails.push($(this).text())
      });
      if(errorDetails.length > 8) {
        errorDetails = errorDetails.slice(0, 7);
        errorDetails.push("...");
      }
      //<img src='"+ ERROR_IMAGE + "'>
      // TODO errorDetails in title: is this right?
      var out = "<table class='errorMessageTable' border='0'><tr><td class='errorIcon'></td><td><span class='cdf_error' title=\""
        + errorDetails.join('<br/>').replace(/"/g,"'") + "\" >" + errorMessage + " </span></td></tr></table>";
    
      // if this is a hidden component, we'll place this in the error div
      if(obj.visible == false) {
        $("#" + this.CDF_ERROR_DIV).append("<br />" + out);
      } else{
        $('#' + obj.htmlObject).html(out);
      }
    
      return null;
    },

    /**
     * Sets a setting in the server.
     *
     * @param {string} name   Name of the setting.
     * @param {Object} object Value for the setting.
     *
     * @deprecated
     */
    setSettingsValue: function(name, object) {
    
      var data = {
        method: "set",
        key: name,
        value: JSON.stringify(object)
      };
      $.post(DashboardExt.getSettings("set", null), data, function() {});
    },

    /**
     * Gets a setting value from the server.
     *
     * @param {string}   key   Key to the setting.
     * @param {function} value Callback function.
     *
     * @deprecated
     */
    getSettingsValue: function(key, value) {
    
      $.ajax({
        type: 'GET',
        dataType: "json",
        url: DashboardExt.getSettings("get", key),
        data: args,
        async: true,
        xhrFields: {
          withCredentials: true
        }
      }).done(typeof value == 'function' ? value : function(json) {
        value = json;
      });
    },

    /**
     * Fetches data from the server according to a Chart Definition object.
     * This method is deprecated, a {@link cdf.dashboard.Query|Query} instance should be used instead.
     *
     * @param {Object}   cd       Chart definition object.
     * @param {Object}   params   Parameter object.
     * @param {function} callback Callback to be called with results.
     *
     * @deprecated
     */
    fetchData: function(cd, params, callback) {
      Logger.warn('Dashboard fetchData() is deprecated. Use Query objects instead');
      // Detect and handle CDA data sources
      if(cd != undefined && cd.dataAccessId != undefined) {
        for(var param in params) {
          cd['param' + params[param][0]] = this.getParameterValue(params[param][1]);
        }
    
        $.post(
          CdaQueryExt.getDoQuery(),
          cd,
          function(json) {
            callback(json);
          },
          'json'
        ).error(this.handleServerError);
      }
      // When we're not working with a CDA data source, we default to using jtable to fetch the data...
      else if(cd != undefined) {
    
        var xactionFile = (cd.queryType == 'cda') ? "jtable-cda.xaction" : "jtable.xaction";
    
        $.post(
          XactionComponentExt.getCdfXaction("pentaho-cdf/actions", xactionFile),
          cd,
          function(result) {
            callback(result.values);
          },
          'json'
        );
      }
      // ... or just call the callback when no valid definition is passed
      else {
        callback([]);
      }
    }
  });
});
