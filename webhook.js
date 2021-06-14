/*
 * This script is maintained at https://github.com/puzzle/prometheus-rocket-chat/blob/master/webhook.js
 * See https://rocket.chat/docs/administrator-guides/integrations/ for a how-to.
 */
class Script {
  process_incoming_request({ request }) {
    console.log(request.content);

    // Return a rocket.chat message object.
    // If channel is undefined, the default channel from the webhook configuration is used
    return {
      content: {
        username: "Prometheus Alert",
        attachments: this.getAlerts(request.content),
        channel: request.content.alerts[0].labels.rocketchat_channel
      }
    };
  }

  getAlerts(content) {
    let alertColor = this.getAlertColor(content.status);
    let attachments = [];
    for (i = 0; i < content.alerts.length; i++) {
      let alert = content.alerts[i];

      attachments.push({
        color: alertColor,
        title_link: content.externalURL,
        title: this.getAlertTitle(alert, content.status),
        text: "[ ns: " + alert.labels.namespace  + " ] \n"+ alert.annotations.message
      });
    }
    return attachments;
  }

  getAlertColor(status) {
    if (status === "resolved") {
      return "good";
    } else if (status === "firing") {
      return "danger";
    } else {
      return "warning";
    }
  }

  getAlertTitle(alert, status) {
    let title = "[" + this.getAlertStatus(alert, status).toUpperCase() + "] ";
    if (!!alert.annotations.summary) {
      title += alert.annotations.summary;
    } else if (!!alert.labels.alertname) {
      title += alert.labels.alertname;
      title += " ";
      title += alert.labels.job;
    } else if (!!alert.labels.instance) {
      title += ": ";
      title +=  alert.labels.instance;
    }
    return title;
  }

  getAlertStatus(alert, status) {
    if (status === "firing" && !!alert.labels.severity) {
      return status + "|" + alert.labels.severity;
    } else {
      return String(status);
    }
  }

}
