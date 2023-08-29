import pandas as pd
import mplfinance as mpf
import numpy as np
import requests
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from dateutil.relativedelta import relativedelta
# from app.sendMail import *

price_mapping = {
    'open': 'first',
    'high': 'max',
    'low': 'min',
    'close': 'last',
}

slow_length = 21
fast_length = 55
signal_smoothing = 8

long_trend_lookback = 200
short_trend_lookback = 21

long_signals = {'day': 24, 'week': 10, 'month': 10}

timeframeTocandle = {"day": "1H", "week": "4H", "month": "1D"}


def get_Data(field, symbol, timeframe, api_key='649c6a4cc9adc3.44222266'):
    start_day_timestamp = (datetime.now() - timedelta(days=300)).timestamp()

    if field == 'forex':
        candle_url = f"https://eodhistoricaldata.com/api/intraday/{symbol}.FOREX?from={start_day_timestamp}&fmt=json&api_token={api_key}&interval=1h"

    elif field == 'crypto':
        candle_url = f"https://eodhistoricaldata.com/api/intraday/{symbol}.CC?from={start_day_timestamp}&fmt=json&api_token={api_key}&interval=1h"

    else:
        candle_url = f"https://eodhistoricaldata.com/api/intraday/{symbol}.US?from={start_day_timestamp}&fmt=json&&api_token={api_key}&interval=1h"

    print(candle_url)
    response = requests.get(candle_url)
    candle_data = pd.DataFrame(response.json())
    candle_data.drop(['volume', 'gmtoffset', 'timestamp'], axis=1, inplace=True)
    candle_data = candle_data.rename(columns={'datetime': 'date'})
    candle_data.dropna(inplace=True)

    candle_data['date'] = pd.to_datetime(candle_data['date'])
    candle_data.set_index('date', inplace=True)

    candle_data = candle_data[candle_data.index.dayofweek < 5]

    ana_data1 = candle_data.iloc[-300:][['open', 'high', 'low', 'close']].resample('1D').agg(price_mapping)
    candle_data1 = candle_data.iloc[-300:]
    ana_data2 = candle_data.iloc[-36000:][['open', 'high', 'low', 'close']].resample('1W').agg(price_mapping)
    candle_data2 = candle_data.iloc[-36000:][['open', 'high', 'low', 'close']].resample('4H').agg(price_mapping)
    ana_data3 = candle_data[['open', 'high', 'low', 'close']].resample('1M').agg(price_mapping)
    candle_data3 = candle_data[['open', 'high', 'low', 'close']].resample('1D').agg(price_mapping)

    return [candle_data1, ana_data1], [candle_data2, ana_data2], [candle_data3, ana_data3]


def calculate_macd(df):
    ema_slow = df['close'].ewm(span=slow_length, adjust=False).mean()
    ema_fast = df['close'].ewm(span=fast_length, adjust=False).mean()
    df['macd'] = ema_fast - ema_slow
    # Create a new column 'macd_signal' and assign default value as 'Neutral'
    df['macd_signal'] = 'Neutral'

    # Set conditions and assign labels based on MACD values
    df.loc[(df['macd'] > 0) & (df['macd'].diff() > 0), 'macd_signal'] = 'Bullish Aggressive'
    df.loc[(df['macd'] > 0) & (df['macd'].diff() < 0), 'macd_signal'] = 'Bullish Caution'
    df.loc[(df['macd'] < 0) & (df['macd'].diff() < 0), 'macd_signal'] = 'Bearish Aggressive'
    df.loc[(df['macd'] < 0) & (df['macd'].diff() > 0), 'macd_signal'] = 'Bearish Caution'

    df.dropna(inplace=True)
    return df


def calculate_pivot_points(df):
    # Calculate Pivot Points, Resistance levels, Support levels, and Middle points
    df['Pivot_Point'] = (df['high'] + df['low'] + df['close']) / 3

    df['R1'] = (2 * df['Pivot_Point']) - df['low']
    df['R2'] = df['Pivot_Point'] + (df['high'] - df['low'])
    df['R3'] = df['high'] + 2 * (df['Pivot_Point'] - df['low'])

    df['S1'] = (2 * df['Pivot_Point']) - df['high']
    df['S2'] = df['Pivot_Point'] - (df['high'] - df['low'])
    df['S3'] = df['low'] - 2 * (df['high'] - df['Pivot_Point'])

    df['M1'] = (df['S1'] + df['S2']) / 2
    df['M2'] = (df['Pivot_Point'] + df['S1']) / 2
    df['M3'] = (df['R1'] + df['Pivot_Point']) / 2
    df['M4'] = (df['R1'] + df['R2']) / 2

    df.dropna(inplace=True)

    return df


def add_rows(df, timeframe='day'):
    now_date = df.index[-1]
    if timeframe == 'day':
        start_time = df.index[-1] + timedelta(hours=1)
        if df.index[-1].weekday() == 4:
            end_time = df.index[-1].date() + timedelta(days=4)
        else:
            end_time = df.index[-1].date() + timedelta(days=2)
        new_df = pd.DataFrame(
            {'date': pd.date_range(start=start_time, end=end_time, freq='1H'), 'open': 0, 'high': 0, 'low': 0,
             'close': 0}).set_index('date')
        df = pd.concat([df, new_df])
    elif timeframe == 'week':
        start_time = df.index[-1] + timedelta(hours=4)
        end_time = df.index[-1].date() + timedelta(days=8)
        business_days = pd.date_range(start=start_time, end=end_time, freq='4H')

        print(start_time)
        new_df = pd.DataFrame(
            {'date': business_days[business_days.to_series().dt.dayofweek < 5], 'open': 0, 'high': 0, 'low': 0,
             'close': 0}).set_index('date')

        if new_df.index[0] == now_date:
            new_df = new_df.iloc[1:]
        df = pd.concat([df, new_df])
    else:
        if df.index[-1].weekday() == 4:
            start_time = df.index[-1] + timedelta(days=3)
        else:
            start_time = df.index[-1] + timedelta(days=1)
        end_time = (df.index[-1].date() + relativedelta(months=2)).replace(day=1)
        if end_time.weekday() == 5:
            end_time = end_time - timedelta(days=1)
        elif end_time.weekday() == 6:
            end_time = end_time - timedelta(days=2)

        business_days = pd.bdate_range(start=start_time, end=end_time, freq='1D')

        new_df = pd.DataFrame(
            {'date': business_days[business_days.to_series().dt.dayofweek < 5], 'open': 0, 'high': 0, 'low': 0,
             'close': 0}).set_index('date')
        df = pd.concat([df, new_df])

    return df, now_date


def add_column(df, timeframe):
    if timeframe == 'day':
        df['day'] = pd.to_datetime(df.index.date)
    elif timeframe == 'week':
        df['week'] = df.index.strftime('%Y-%U')
    elif timeframe == 'month':
        df['month'] = df.index.to_period('M')
    return df


def get_nextday(date):
    next_day = date + timedelta(days=1)

    # Check if the next day falls on a weekend (Saturday or Sunday)
    if next_day.weekday() >= 5:
        # If it is a Saturday, add 3 days
        if next_day.weekday() == 5:
            next_day = next_day + timedelta(days=2)
        # If it is Sunday, add 2 days
        else:
            next_day = next_day + timedelta(days=1)

    return next_day


def merge_Dataframe(candleData, anaData, timeframe):
    df = candleData.merge(anaData[['Pivot_Point', 'R1', 'R2', 'R3', 'S1', 'S2', 'S3', 'M1', 'M2', 'M3', 'M4']],
                          left_on=candleData[timeframe], right_index=True)
    # Replace the NaN values with the previous values (forward fill)
    df.fillna(method='ffill', inplace=True)
    return df


def treding_analysis(candleData, anaData, timeframe='day'):
    candleData, barrier = add_rows(candleData, timeframe)
    candleData = calculate_macd(add_column(candleData, timeframe))

    if timeframe == 'day':
        anaData.index = anaData.index.map(get_nextday)
    elif timeframe == 'week':
        # anaData.index = anaData.index + datetime.timedelta(weeks=1)
        anaData.index = anaData.index.strftime('%Y-%U')
    elif timeframe == 'month':
        anaData.index = anaData.index + pd.DateOffset(months=1)
        anaData.index = anaData.index.to_period('M')

    anaData = calculate_pivot_points(anaData)
    resutData = merge_Dataframe(candleData, anaData, timeframe)
    # resutData.to_csv('result.csv', header=True, index=True)
    return resutData, barrier


def get_long_trendline(data, lookback, dimension):
    lookback = min(len(data), lookback)

    # Calculate the Linear Regression Line
    x = range(1, lookback + 1)  # x represents the time period
    y = data['close'][-lookback:]
    regression = np.polyfit(x, y, deg=dimension)  # Perform linear regression
    regression_line = np.polyval(regression, x)  # Calculate the regression line

    # Calculate the Standard Deviation
    std_dev = np.std(y)

    # Calculate upper and lower lines of Linear Regression Channel
    upper_channel = regression_line + std_dev
    lower_channel = regression_line - std_dev

    return upper_channel, lower_channel


def get_short_trend(data, lookback, trendline):
    # Calculate the Linear Regression Line
    x = range(1, lookback + 1)  # x represents the time period
    y = data['close'][-lookback:]
    regression = np.polyfit(x, y, deg=1)  # Perform linear regression
    regression_line = np.polyval(regression, x)  # Calculate the regression line

    # Calculate the Standard Deviation
    std_dev = np.std(y)

    # Calculate upper and lower lines of Linear Regression Channel
    upper_channel = regression_line + std_dev
    lower_channel = regression_line - std_dev

    trendlines = [
        [(data.index[-lookback], upper_channel[0]), (data.index[-1], upper_channel[-1])],
        [(data.index[-lookback], lower_channel[0]), (data.index[-1], lower_channel[-1])],
    ]

    if trendline:
        alines = dict(alines=trendlines, colors=['cyan'], linewidths=0.7)
        return alines
    else:
        if regression_line[0] <= regression_line[1]:
            return 'bullish'
        else:
            return 'bearish'


def display_trendline(long_data, long_upper, long_lower, short_alines):
    fig, axes = mpf.plot(long_data, type='candle', style='yahoo', title='Trend Analysis', ylabel='Price',
                         addplot=[mpf.make_addplot(long_upper, color='b'),
                                  mpf.make_addplot(long_lower, color='b'),
                                  ],
                         alines=short_alines,
                         figsize=(20, 10),
                         returnfig=True, )
    fig.savefig('trend_analysis.png')


def get_signal(row):
    if row['macd_signal'] == 'Bullish Aggressive' or row['macd_signal'] == 'Bullish Caution':
        return 'bullish'
    else:
        return 'bearish'


def generate_rect(start_idx, end_idx, data, signal):
    # Get the x-coordinates of the rectangle using the index range
    rect_x = start_idx  # Using start attribute of the slice
    rect_width = end_idx - start_idx  # Using stop attribute of the slices

    if signal == 'bearish':
        # Define the y-coordinate and dimensions of the rectangle
        rect_y = data['Pivot_Point'][0]
        rect_height = data['M3'][0] - data['Pivot_Point'][0]

        # Create the rectangle patch
        rect_patch1 = Rectangle((rect_x, rect_y), rect_width, rect_height, linewidth=1, edgecolor='r', facecolor='r',
                                alpha=0.2)

        # Add text on the rectangle
        text_x = rect_x + rect_width / 2  # X-coordinate of the text (centered within the rectangle)
        text_y = rect_y - rect_height / 4  # Y-coordinate of the text (centered within the rectangle)
        text1 = [text_x, text_y, 'Selling Zone - Low Level: ' + str(round(data['Pivot_Point'][0], 5))]

        text_y = rect_y + rect_height * 1.25  # Y-coordinate of the text (centered within the rectangle)
        text4 = [text_x, text_y, 'Selling Zone - High Level: ' + str(round(data['M3'][0], 5))]

        # Define the y-coordinate and dimensions of the rectangle
        rect_y = data['S2'][0]
        rect_height = data['M1'][0] - data['S2'][0]

        text_y = rect_y - rect_height / 4  # Y-coordinate of the text (centered within the rectangle)
        text2 = [text_x, text_y, 'Profit Zone - ' + str(round(data['S2'][0], 5))]

        text_y = rect_y + rect_height * 1.25  # Y-coordinate of the text (centered within the rectangle)
        text3 = [text_x, text_y, 'Target Level - ' + str(round(data['M1'][0], 5))]

        # Create the rectangle patch
        rect_patch2 = Rectangle((rect_x, rect_y), rect_width, rect_height, linewidth=1, edgecolor='g', facecolor='g',
                                alpha=0.1)
    else:
        # Define the y-coordinate and dimensions of the rectangle
        rect_y = data['M2'][0]
        rect_height = data['Pivot_Point'][0] - data['M2'][0]

        # Create the rectangle patch
        rect_patch1 = Rectangle((rect_x, rect_y), rect_width, rect_height, linewidth=1, edgecolor='g', facecolor='g',
                                alpha=0.2)

        # Add text on the rectangle
        text_x = rect_x + rect_width / 2  # X-coordinate of the text (centered within the rectangle)
        text_y = rect_y - rect_height / 4  # Y-coordinate of the text (centered within the rectangle)
        text1 = [text_x, text_y, 'Buying Zone - Low Level: ' + str(round(data['M2'][0], 5))]

        text_y = rect_y + rect_height * 1.25  # Y-coordinate of the text (centered within the rectangle)
        text4 = [text_x, text_y, 'Buying Zone - High Level: ' + str(round(data['Pivot_Point'][0], 5))]

        # Define the y-coordinate and dimensions of the rectangle
        rect_y = data['M4'][0]
        rect_height = data['R2'][0] - data['M4'][0]

        text_y = rect_y - rect_height / 4  # Y-coordinate of the text (centered within the rectangle)
        text2 = [text_x, text_y, 'Target Level - ' + str(round(data['M4'][0], 5))]

        text_y = rect_y + rect_height * 1.25  # Y-coordinate of the text (centered within the rectangle)
        text3 = [text_x, text_y, 'Profit Zone - ' + str(round(data['R2'][0], 5))]

        # Create the rectangle patch
        rect_patch2 = Rectangle((rect_x, rect_y), rect_width, rect_height, linewidth=1, edgecolor='r', facecolor='r',
                                alpha=0.1)

    return rect_patch1, rect_patch2, [text1, text2, text3, text4]


def draw_save_rect(work_data, long_upper, long_lower, short_alines, result, data, now_data, future_data, signal,
                   now_exact_signal, timeframe, current_timestamp, symbol):
    now_data_signal, future_data_signal = signal, signal

    if timeframe == 'day':
        title = 'Daily Expectation'
    elif timeframe == 'week':
        title = 'Weekly Expectation'
    else:
        title = 'Monthly Expectation'

    max_volitile = work_data['high'].max() - work_data['low'].min()

    fig, axes = mpf.plot(work_data, type='candle', style='yahoo',
                         figsize=(30, 20),
                         returnfig=True,
                         addplot=[mpf.make_addplot(long_upper, color='b'),
                                  mpf.make_addplot(long_lower, color='b'),
                                  ],
                         alines=short_alines,
                         xlim=(result.index[0], result.index[-1]),
                         ylim=(
                             min(work_data['low'].min(), data['S2'][0], now_data['S2'][0]) - max_volitile / 3,
                             max(work_data['high'].max(), data['R2'][0], now_data['R2'][0]) + max_volitile / 3),
                         # tight_layout=True,  # Adjust the layout if needed
                         )

    # Get the axis from the list
    ax = axes[0]
    ax.set_title(title, fontsize=25, style='normal', fontfamily='Comic Sans MS',
                 loc='center')
    ax.text(1, 1, now_exact_signal, fontsize=30, style='normal', fontfamily='Comic Sans MS',
            ha='right', va='top', transform=ax.transAxes, color='gray')

    ax.text(0.5, 0.55, f'{symbol} - {timeframeTocandle[timeframe]}', transform=ax.transAxes,
            fontsize=60, color='gray', alpha=0.3,
            ha='center', va='center', rotation=0)
    ax.text(0.5, 0.45, "(c)2023 TradePlans.ai", transform=ax.transAxes,
            fontsize=60, color='gray', alpha=0.3,
            ha='center', va='center', rotation=0)

    # # Convert date range to index range
    # start_idx = result.index.get_loc(data.index[0])
    # end_idx = result.index.get_loc(data.index[-1])
    #
    # rect_patch1, rect_patch2, text1 = generate_rect(start_idx, end_idx, data, data_signal)

    # Convert date range to index range
    now_start_idx = result.index.get_loc(now_data.index[0])
    now_end_idx = result.index.get_loc(now_data.index[-1])

    rect_patch3, rect_patch4, text2 = generate_rect(now_start_idx, now_end_idx, now_data, now_data_signal)

    # Convert date range to index range
    after_start_idx = result.index.get_loc(future_data.index[0])
    after_end_idx = result.index.get_loc(future_data.index[-1])

    rect_patch5, rect_patch6, text3 = generate_rect(after_start_idx, after_end_idx, future_data, future_data_signal)

    # Add the rectangle patch to the axis
    # ax.add_patch(rect_patch1)
    # ax.add_patch(rect_patch2)
    ax.add_patch(rect_patch3)
    ax.add_patch(rect_patch4)
    ax.add_patch(rect_patch5)
    ax.add_patch(rect_patch6)

    for i in text2 + text3:
        ax.text(i[0], i[1], i[2], ha='center', va='center', fontsize=8)

    # plt.savefig('app/images/' + str(current_timestamp) + '-' + timeframe + '.png')
    plt.savefig('images/' + str(current_timestamp) + '-' + timeframe + '.png')

    # plt.show()


def display_plan(result, barrier, timeframe='day', long_upper=None, long_lower=None, short_alines=None,
                 user_signal='bullish', long_signal='bullish', current_timestamp=123, symbol="EURUSD"):
    today = barrier
    work_data = result.loc[:barrier]

    if timeframe == 'day':
        now = today.strftime('%Y-%m-%d')
        if today.weekday() == 0:
            before = (barrier - timedelta(days=3)).strftime('%Y-%m-%d')
        else:
            before = (barrier - timedelta(days=1)).strftime('%Y-%m-%d')

        if today.weekday() == 4:
            after = (barrier + timedelta(days=3)).strftime('%Y-%m-%d')
        else:
            after = (barrier + timedelta(days=1)).strftime('%Y-%m-%d')

        now_data = result[result['day'] == now]
        data = work_data[work_data['day'] == before]
        future_data = result[result['day'] == after]

    elif timeframe == 'week':
        work_data = work_data[work_data['high'] != 0]
        last_day = today - timedelta(weeks=1)
        future_day = today + timedelta(weeks=1)

        before = last_day.strftime('%Y-%U')
        now = today.strftime('%Y-%U')
        after = future_day.strftime('%Y-%U')

        now_data = result[result['week'] == now]
        data = work_data[work_data['week'] == before]
        future_data = result[result['week'] == after]

    else:
        last_day = today - relativedelta(months=1)
        future_day = today + relativedelta(months=1)

        before = last_day.strftime('%Y-%m')
        now = today.strftime('%Y-%m')
        after = future_day.strftime('%Y-%m')

        now_data = result[result['month'] == now]
        data = work_data[work_data['month'] == before]
        future_data = result[result['month'] == after]

    print(data.index[0], data.index[-1])

    # data_signal, _ = get_signal(data.iloc[0])
    now_data_signal = get_signal(now_data.loc[today])

    if long_signal == 'bullish':
        if now_data_signal == 'bullish':
            now_exact_signal = 'Bullish Confident'
        else:
            now_exact_signal = 'Bullish Conservative'
    else:
        if now_data_signal == 'bearish':
            now_exact_signal = 'Bearish Confident'
        else:
            now_exact_signal = 'Bearish Conservative'

    # now_data_signal, now_exact_signal = 'bearish', 'Bearish - Caution'
    future_data_signal = now_data_signal

    # if now_data_signal == user_signal:
    draw_save_rect(work_data, long_upper, long_lower, short_alines, result, data, now_data, future_data,
                   long_signal, now_exact_signal, timeframe, current_timestamp, symbol)

    return now_exact_signal
    # else:
    #     draw_save_rect(work_data, long_upper, long_lower, short_alines, result, data, now_data, future_data, 'bullish',
    #                    now_exact_signal, image_name)
    #     draw_save_rect(work_data, long_upper, long_lower, short_alines, result, data, now_data, future_data, 'bearish',
    #                    now_exact_signal,image_name)


def chart_processing(candle_data, ana_data, timeframe, signal, current_timestamp, symbol):
    result, barrier = treding_analysis(candle_data, ana_data, timeframe)

    barrier_idx = result.index.get_loc(barrier)

    try:
        len_fake_data = len(result) - barrier_idx.start
    except:
        len_fake_data = len(result) - barrier_idx

    candle_data.dropna(inplace=True)
    long_upper, long_lower = get_long_trendline(candle_data, long_trend_lookback, 8)
    short_alines = get_short_trend(candle_data, short_trend_lookback, True)
    long_signal = get_short_trend(candle_data, long_signals[timeframe], False)
    if timeframe == 'week': result.to_csv('data.csv', index=True)
    return display_plan(result[-long_trend_lookback - len_fake_data + 101:], barrier, timeframe,
                        long_upper[100:], long_lower[100:], short_alines, signal, long_signal, current_timestamp,
                        symbol)


def main(symbol, signal, user_email, user_name):
    print(symbol, signal, user_email)
    current_timestamp = datetime.now().timestamp()

    try:
        daily_data, weekly_data, monthly_data = get_Data('stock', symbol, 'day')
    except:
        daily_data, weekly_data, monthly_data = get_Data('stock', symbol, 'day')

    

    daily_signal = chart_processing(daily_data[0], daily_data[1], 'day', signal, current_timestamp, symbol)
    print('daily success!!!!!!!!!!!!!!!')
    weekly_signal = chart_processing(weekly_data[0], weekly_data[1], 'week', signal, current_timestamp, symbol)
    print('weekly success!!!!!!!!!!!!!!')

    # try:
    #     candle_data, ana_data = get_Data(symbol, 'month')
    # except:
    #     candle_data, ana_data = get_Data(symbol, 'month')
    monthly_signal = chart_processing(monthly_data[0], monthly_data[1], 'month', signal, current_timestamp, symbol)
    print('montly success!!!!!!!!!!!!!!!')

    # send_mail(user_email, symbol, [daily_signal, weekly_signal, monthly_signal],
    #           f'app/images/{str(current_timestamp)}-day.png', f'app/images/{str(current_timestamp)}-week.png',
    #           f'app/images/{str(current_timestamp)}-month.png', user_name)
    print('email sent success!!!!!!!!!!!!!!!!!')


main('SPY', 'bullish', 'harrybrooks7307@gmail.com', 'JunHao')
