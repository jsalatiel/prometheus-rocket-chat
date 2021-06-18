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
        emoji: this.getAlertEmoji(request.content.status),
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
        collapsed: false,
        title_link: content.externalURL,
        title: this.getAlertTitle(alert, content.status),
        text: this.getAlertText(alert)
      });
    }
    return attachments;
  }

  getAlertColor(status) {
    if (status === "resolved") {
      return "#00FF00";
    } else if (status === "firing") {
      return "#FF0000";
    } else {
      return "#FFFF00";
    }
  }

  getAlertEmoji(status) {
    if (status === "resolved") {
      return ":white_check_mark:";
    } else if (status === "firing") {
      return ":scream:";
    } else {
      return ":thinking:";
    }
  }

  getAlertText(alert) {
    let msg = "[";
    if (!!alert.labels.namespace) {
        msg = msg + alert.labels.namespace + "/";
    }
    if (!!alert.labels.job) {
      msg= msg + alert.labels.job;
    }
    msg +=  "] "

    if (msg == "[] ")
      msg=""

    if (!!alert.labels.node) {
      msg = msg + "node: " + alert.labels.node + "<br>";
    } else if (!!alert.labels.instance) {
      msg = msg + "instance: " + alert.labels.instance + "<br>";
    }
    if (!!alert.annotations.message) {
      msg = msg + alert.annotations.message+ "<br>";
    }
    if (!!alert.annotations.description) {
      msg = msg + alert.annotations.description+ "<br>";
    }
    return msg;
  }

  getAlertTitle(alert, status) {
    let title = "[" + this.getAlertStatus(alert, status).toUpperCase() + "] ";
    if (!!alert.annotations.summary) {
      title += alert.annotations.summary;
    } else if (!!alert.labels.alertname) {
      title += alert.labels.alertname;
    } 
    return title;
  }

  getAlertStatus(alert, status) {
    if (status === "firing" && !!alert.labels.severity) {
      return alert.labels.severity;
    } else {
      return String(status);
    }
  }

}
