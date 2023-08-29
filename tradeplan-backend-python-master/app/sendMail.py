import smtplib
import openai
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

openai.api_key = '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'


def generate_text(asset, signals, user_name):
    prompt = f"""
    Our trader posted {asset} trade plan.
    Based on trader's plan, I generate 3 charts for our daily, weekly and monthly strategy for him and am going to email feedback to him.
    
    
    ***
    I displayed 8-dimension trendline for the whole candles, straight trendline for 21 candles, trade zones and target-profit zones on each chart I generated.
    
    Based on 3 charts I generated,
    1. Daily signal is {signals[0]}. Daily {signalToAction[signals[0]]} zone is from {signal_data[0][0][0]} to {signal_data[0][0][1]} and target-profit zone is from {signal_data[0][0][2]} to {signal_data[0][0][3]}.
    2. Weekly signal is {signals[1]}. Weekly {signalToAction[signals[1]]} zone is from {signal_data[1][0][0]} to {signal_data[1][0][1]} and target-profit zone is from {signal_data[1][0][2]} to {signal_data[1][0][3]}.
    3. Monthly signal is {signals[2]}. Weekly {signalToAction[signals[2]]} zone is from {signal_data[2][0][0]} to {signal_data[2][0][1]} and target-profit zone is from {signal_data[2][0][2]} to {signal_data[2][0][3]}.
    Must explain this one deeply and technically using common sense knowledge!!!
    ***
    
    
    Here are tips for our feedback.
    1. Start from greeting like "Hi, {user_name}" and thank for sharing plan.
    2. Must include Common Sense Knowledge about the pair
    3. Rewrite trend signals with common sense
    4. Explain about 3 charts I generated technically and deeply, informally.
    5. Generated Text must look good with proper space and enter.
    6. Must end with "Sincerely, Aiden-TradePlans.AI"
    
    write feedback deeply and technically based on tips
    must write like a human!
    
    """

    try:
        response = openai.Completion.create(
            engine='text-davinci-003',  # Use 'davinci' instead if GPT-3.5-turbo is not available
            prompt=prompt,
            temperature=0.8,
            max_tokens=1000,
            n=1,
            stop=None,
        )

        return response.choices[0].text.strip().replace('\n', '<br/>').replace('We ', 'I ')
    except:
        return None


def send_mail(receive_email, asset, signals, img1, img2, img3, user_name):
    smtpserver = smtplib.SMTP("smtp.gmail.com", 587)
    smtpserver.ehlo()
    smtpserver.starttls()
    smtpserver.ehlo()
    smtpserver.login('tradeplans.ai@gmail.com', 'bchxcsfgstevxxbj')

    # Create a multipart message
    msg = MIMEMultipart()

    msg['From'] = 'tradeplans.ai@gmail.com'
    msg['To'] = receive_email
    msg['Subject'] = 'Trading Analysis'

    text = generate_text(asset, signals, user_name)

    # HTML body with images and text
    if text != None:
        html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #F2F2F2; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center;">
                    <div style="text-align: center;">
                    <h1 style="color: #333333; font-size: 27px; ">Welcome to Your Plan!</h1>
                    <p style="color: #555555; font-size: 18px; text-align: left;">
                        {text}
                    </p>
                    <p style="color: #dedede; font-size: 18px; text-align: left; background-color: #001529;">
                        <span style="font-weight: bold; color: #ff5900;">Risk Warning:</span> This tool and its content
                        should not be construed as financial advice. Signals and readings displayed by the tool are our
                        opinions only and are meant only to be educational. By viewing this tool, you agree that
                        TradePlans.ai is not liable for any gains or losses you may incur from the financial decisions you
                        make. Data displayed is not guaranteed to be 100% accurate or real-time, and may be subject to
                        latency or errors. Please consult a licensed financial advisor prior to making any investment
                        decisions. Trading is not appropriate for everyone. Past performance is not indicative of future
                        results.
                    </p>
                    
                    <img src="cid:image1" alt="Daily Strategy" width="400">
                    <img src="cid:image2" alt="Weekly Strategy" width="400">
                    <img src="cid:image3" alt="Monthly Strategy" width="400">
                </div>
                </body>
            </html>
        """
    else:
        html = f"""
            <html>
              <body>
                <h1>Welcome to Your Plan!</h1>
                <p>Thank you for posting a trade plan for {asset}.  Below you will find 3 trade plans for a Daily, Weekly and Monthly strategy.</p>
                <img src="cid:image1" alt="Daily Strategy" width="400">
                <img src="cid:image2" alt="Weekly Strategy" width="400">
                <img src="cid:image3" alt="Monthly Strategy" width="400">
              </body>
            </html>
        """

    # Add HTML body to the message
    email_body = MIMEText(html, 'html')
    msg.attach(email_body)

    with open(img1, 'rb') as img_file:
        image1 = MIMEImage(img_file.read())
        image1.add_header('Content-ID', '<image1>')
        image1.add_header('Content-Disposition', 'inline', filename='image1.jpg')
        msg.attach(image1)

    with open(img2, 'rb') as img_file:
        image2 = MIMEImage(img_file.read())
        image2.add_header('Content-ID', '<image2>')
        image2.add_header('Content-Disposition', 'inline', filename='image2.jpg')
        msg.attach(image2)

    with open(img3, 'rb') as img_file:
        image3 = MIMEImage(img_file.read())
        image3.add_header('Content-ID', '<image3>')
        image3.add_header('Content-Disposition', 'inline', filename='image3.jpg')
        msg.attach(image3)

    # Send the email
    smtpserver.sendmail('tradeplans.ai@gmail.com', receive_email, msg.as_string())
    smtpserver.quit()
