CREATE TABLE user (
    user_id BIGINT PRIMARY KEY           -- Unique identifier for the user in Garmin Connect.
    , full_name TEXT                       -- Full name of the user.
    , birth_date DATE                      -- User birth date.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
);
CREATE TABLE user_profile (
    user_profile_id INTEGER PRIMARY KEY  -- Auto-incrementing primary key for user profile records.
    , user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this profile record belongs to.
    , gender TEXT                          -- User gender (e.g., ''MALE'', ''FEMALE'').
    , weight FLOAT                         -- User weight in grams.
    , height FLOAT                         -- User height in centimeters.
    , vo2_max_running FLOAT                -- VO2 max value for running activities in ml/kg/min.
    , vo2_max_cycling FLOAT                -- VO2 max value for cycling activities in ml/kg/min.
    , lactate_threshold_speed FLOAT        -- Lactate threshold speed in meters per second.
    , lactate_threshold_heart_rate INTEGER -- Lactate threshold heart rate in beats per minute.
    , moderate_intensity_minutes_hr_zone INTEGER -- Heart rate zone for moderate intensity exercise minutes.
    , vigorous_intensity_minutes_hr_zone INTEGER -- Heart rate zone for vigorous intensity exercise minutes.
    , latest BOOLEAN NOT NULL DEFAULT 0    -- Boolean flag indicating whether this is the latest user profile record.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE UNIQUE INDEX user_profile_user_id_latest_unique_idx
ON user_profile (user_id)
WHERE latest = 1;
CREATE TABLE activity (
    activity_id BIGINT PRIMARY KEY       -- Unique identifier for the activity in Garmin Connect.
    , user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user performed this activity.
    , activity_name TEXT                   -- User-defined name for the activity.
    , activity_type_id INTEGER NOT NULL    -- Unique identifier for the activity type (e.g., ''1'' for running, ''11'' for cardio).
    , activity_type_key TEXT NOT NULL      -- String key for the activity type (e.g., ''running'', ''lap_swimming'', ''road_biking'', ''indoor_cardio'').
    , event_type_id INTEGER NOT NULL       -- Unique identifier for the event type.
    , event_type_key TEXT NOT NULL         -- String key for the event type (e.g., ''other'').
    , start_ts DATETIME NOT NULL           -- Activity start time.
    , end_ts DATETIME NOT NULL             -- Activity end time.
    , timezone_offset_hours FLOAT NOT NULL -- Timezone offset from UTC in hours to infer local time (e.g., -7.0 for UTC-07:00, 5.5 for UTC+05:30).
    , duration FLOAT                       -- Total duration of the activity in seconds.
    , elapsed_duration FLOAT               -- Elapsed time including pauses and stops in seconds.
    , moving_duration FLOAT                -- Time spent in motion during the activity in seconds.
    , distance FLOAT                       -- Total distance covered during the activity in meters.
    , lap_count INTEGER                    -- Number of laps/segments in the activity.
    , average_speed FLOAT                  -- Average speed during the activity in meters per second.
    , max_speed FLOAT                      -- Maximum speed reached during the activity in meters per second.
    , start_latitude FLOAT                 -- Starting latitude coordinate in decimal degrees.
    , start_longitude FLOAT                -- Starting longitude coordinate in decimal degrees.
    , end_latitude FLOAT                   -- Ending latitude coordinate in decimal degrees.
    , end_longitude FLOAT                  -- Ending longitude coordinate in decimal degrees.
    , location_name TEXT                   -- Geographic location name where the activity took place.
    , aerobic_training_effect FLOAT        -- Aerobic training effect score (0.0-5.0 scale).
    , aerobic_training_effect_message TEXT -- Detailed message about aerobic training effect.
    , anaerobic_training_effect FLOAT      -- Anaerobic training effect score (0.0-5.0 scale).
    , anaerobic_training_effect_message TEXT -- Detailed message about anaerobic training effect.
    , training_effect_label TEXT           -- Text description of the training effect (e.g., ''AEROBIC_BASE'', ''UNKNOWN'').
    , activity_training_load FLOAT         -- Training load value representing the physiological impact of the activity.
    , difference_body_battery INTEGER      -- Change in body battery energy level during the activity.
    , moderate_intensity_minutes INTEGER   -- Minutes spent in moderate intensity exercise zone.
    , vigorous_intensity_minutes INTEGER   -- Minutes spent in vigorous intensity exercise zone.
    , calories FLOAT                       -- Total calories burned during the activity.
    , bmr_calories FLOAT                   -- Basal metabolic rate calories burned during the activity.
    , water_estimated FLOAT                -- Estimated water loss during the activity in milliliters.
    , hr_time_in_zone_1 FLOAT              -- Time spent in heart rate zone 1 (active recovery) in seconds.
    , hr_time_in_zone_2 FLOAT              -- Time spent in heart rate zone 2 (aerobic base) in seconds.
    , hr_time_in_zone_3 FLOAT              -- Time spent in heart rate zone 3 (aerobic) in seconds.
    , hr_time_in_zone_4 FLOAT              -- Time spent in heart rate zone 4 (lactate threshold) in seconds.
    , hr_time_in_zone_5 FLOAT              -- Time spent in heart rate zone 5 (neuromuscular power) in seconds.
    , average_hr FLOAT                     -- Average heart rate during the activity in beats per minute.
    , max_hr FLOAT                         -- Maximum heart rate reached during the activity in beats per minute.
    , device_id BIGINT                     -- Unique identifier for the Garmin device used to record the activity.
    , manufacturer TEXT                    -- Manufacturer of the device (typically ''GARMIN'').
    , time_zone_id INTEGER                 -- Garmin''s internal timezone identifier for the activity location.
    , has_polyline BOOLEAN NOT NULL DEFAULT 0  -- Whether GPS track data (polyline) is available for this activity.
    , has_images BOOLEAN NOT NULL DEFAULT 0    -- Whether images are attached to this activity.
    , has_video BOOLEAN NOT NULL DEFAULT 0     -- Whether video is attached to this activity.
    , has_splits BOOLEAN DEFAULT 0             -- Whether split/lap data is available for this activity.
    , has_heat_map BOOLEAN NOT NULL DEFAULT 0  -- Whether heat map data is available for this activity.
    , parent BOOLEAN NOT NULL DEFAULT 0        -- Whether this activity is a parent activity containing sub-activities.
    , purposeful BOOLEAN NOT NULL DEFAULT 0    -- Whether this activity was marked as purposeful training.
    , favorite BOOLEAN NOT NULL DEFAULT 0      -- Whether this activity is marked as a favorite.
    , elevation_corrected BOOLEAN DEFAULT 0    -- Whether elevation data has been corrected.
    , atp_activity BOOLEAN DEFAULT 0           -- Whether this is an Adaptive Training Plan activity.
    , manual_activity BOOLEAN NOT NULL DEFAULT 0 -- Whether this activity was manually entered rather than recorded.
    , pr BOOLEAN NOT NULL DEFAULT 0            -- Whether this activity contains a personal record.
    , auto_calc_calories BOOLEAN NOT NULL DEFAULT 0 -- Whether calorie calculation was performed automatically.
    , ts_data_available BOOLEAN NOT NULL DEFAULT 0  -- Whether time-series data from FIT file has been processed for this activity.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP           -- Timestamp when the record was last modified in the database.
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
    , UNIQUE (user_id, start_ts)
);
CREATE INDEX activity_user_id_start_ts_idx
ON activity (user_id, start_ts DESC);
CREATE TABLE swimming_agg_metrics (
    activity_id BIGINT PRIMARY KEY       -- References activity(activity_id).
    , pool_length FLOAT                    -- Length of the swimming pool in centimeters.
    , active_lengths INTEGER               -- Number of active pool lengths swum.
    , strokes FLOAT                        -- Total number of strokes taken during the activity.
    , avg_stroke_distance FLOAT            -- Average distance covered per stroke in meters.
    , avg_strokes FLOAT                    -- Average number of strokes per pool length.
    , avg_swim_cadence FLOAT               -- Average swimming cadence in strokes per minute.
    , avg_swolf FLOAT                      -- Average SWOLF score (strokes + time in seconds to cover pool length).
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP           -- Timestamp when the record was last modified in the database.
    , FOREIGN KEY (activity_id) REFERENCES activity (activity_id) ON DELETE CASCADE
);
CREATE TABLE cycling_agg_metrics (
    activity_id BIGINT PRIMARY KEY       -- References activity(activity_id).
    , training_stress_score FLOAT          -- Training Stress Score quantifying workout intensity and duration.
    , intensity_factor FLOAT               -- Intensity Factor representing workout intensity relative to threshold.
    , vo2_max_value FLOAT                  -- VO2 max value measured during the activity in ml/kg/min.
    , avg_power FLOAT                      -- Average power output during the activity in watts.
    , max_power FLOAT                      -- Maximum power output reached during the activity in watts.
    , normalized_power FLOAT               -- Normalized power accounting for variable intensity in watts.
    , max_20min_power FLOAT                -- Best 20-minute average power output in watts.
    , avg_left_balance FLOAT               -- Average left/right power balance as percentage of left leg contribution.
    , avg_biking_cadence FLOAT             -- Average pedaling cadence in revolutions per minute.
    , max_biking_cadence FLOAT             -- Maximum pedaling cadence reached in revolutions per minute.
    , max_avg_power_1 FLOAT                -- Best 1-second average power in watts.
    , max_avg_power_2 FLOAT                -- Best 2-second average power in watts.
    , max_avg_power_5 FLOAT                -- Best 5-second average power in watts.
    , max_avg_power_10 FLOAT               -- Best 10-second average power in watts.
    , max_avg_power_20 FLOAT               -- Best 20-second average power in watts.
    , max_avg_power_30 FLOAT               -- Best 30-second average power in watts.
    , max_avg_power_60 FLOAT               -- Best 1-minute average power in watts.
    , max_avg_power_120 FLOAT              -- Best 2-minute average power in watts.
    , max_avg_power_300 FLOAT              -- Best 5-minute average power in watts.
    , max_avg_power_600 FLOAT              -- Best 10-minute average power in watts.
    , max_avg_power_1200 FLOAT             -- Best 20-minute average power in watts.
    , max_avg_power_1800 FLOAT             -- Best 30-minute average power in watts.
    , max_avg_power_3600 FLOAT             -- Best 60-minute average power in watts.
    , max_avg_power_7200 FLOAT             -- Best 120-minute average power in watts.
    , max_avg_power_18000 FLOAT            -- Best 300-minute average power in watts.
    , power_time_in_zone_1 FLOAT           -- Time spent in power zone 1 (active recovery) in seconds.
    , power_time_in_zone_2 FLOAT           -- Time spent in power zone 2 (endurance) in seconds.
    , power_time_in_zone_3 FLOAT           -- Time spent in power zone 3 (tempo) in seconds.
    , power_time_in_zone_4 FLOAT           -- Time spent in power zone 4 (lactate threshold) in seconds.
    , power_time_in_zone_5 FLOAT           -- Time spent in power zone 5 (VO2 max) in seconds.
    , power_time_in_zone_6 FLOAT           -- Time spent in power zone 6 (anaerobic capacity) in seconds.
    , power_time_in_zone_7 FLOAT           -- Time spent in power zone 7 (neuromuscular) in seconds.
    , min_temperature FLOAT                -- Minimum temperature recorded during the activity in Celsius.
    , max_temperature FLOAT                -- Maximum temperature recorded during the activity in Celsius.
    , elevation_gain FLOAT                 -- Total elevation gained during the activity in meters.
    , elevation_loss FLOAT                 -- Total elevation lost during the activity in meters.
    , min_elevation FLOAT                  -- Minimum elevation during the activity in meters.
    , max_elevation FLOAT                  -- Maximum elevation during the activity in meters.
    , min_respiration_rate FLOAT           -- Minimum respiration rate during the activity in breaths per minute.
    , max_respiration_rate FLOAT           -- Maximum respiration rate during the activity in breaths per minute.
    , avg_respiration_rate FLOAT           -- Average respiration rate during the activity in breaths per minute.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP           -- Timestamp when the record was last modified in the database.
    , FOREIGN KEY (activity_id) REFERENCES activity (activity_id) ON DELETE CASCADE
);
CREATE TABLE running_agg_metrics (
    activity_id BIGINT PRIMARY KEY       -- References activity(activity_id).
    , steps INTEGER                        -- Total number of steps taken during the running activity.
    , vo2_max_value FLOAT                  -- VO2 max value measured during the activity in ml/kg/min.
    , avg_running_cadence FLOAT            -- Average running cadence in steps per minute.
    , max_running_cadence FLOAT            -- Maximum running cadence reached in steps per minute.
    , max_double_cadence FLOAT             -- Maximum double cadence (both feet) in steps per minute.
    , avg_vertical_oscillation FLOAT       -- Average vertical oscillation of running form in centimeters.
    , avg_ground_contact_time FLOAT        -- Average ground contact time per step in milliseconds.
    , avg_stride_length FLOAT              -- Average stride length in centimeters.
    , avg_vertical_ratio FLOAT             -- Average vertical ratio as percentage of stride length.
    , avg_ground_contact_balance FLOAT     -- Average left/right ground contact time balance as percentage.
    , avg_power FLOAT                      -- Average power output during the activity in watts.
    , max_power FLOAT                      -- Maximum power output reached during the activity in watts.
    , normalized_power FLOAT               -- Normalized power accounting for variable intensity in watts.
    , power_time_in_zone_1 FLOAT           -- Time spent in power zone 1 (active recovery) in seconds.
    , power_time_in_zone_2 FLOAT           -- Time spent in power zone 2 (endurance) in seconds.
    , power_time_in_zone_3 FLOAT           -- Time spent in power zone 3 (tempo) in seconds.
    , power_time_in_zone_4 FLOAT           -- Time spent in power zone 4 (lactate threshold) in seconds.
    , power_time_in_zone_5 FLOAT           -- Time spent in power zone 5 (VO2 max) in seconds.
    , min_temperature FLOAT                -- Minimum temperature recorded during the activity in Celsius.
    , max_temperature FLOAT                -- Maximum temperature recorded during the activity in Celsius.
    , elevation_gain FLOAT                 -- Total elevation gained during the activity in meters.
    , elevation_loss FLOAT                 -- Total elevation lost during the activity in meters.
    , min_elevation FLOAT                  -- Minimum elevation during the activity in meters.
    , max_elevation FLOAT                  -- Maximum elevation during the activity in meters.
    , min_respiration_rate FLOAT           -- Minimum respiration rate during the activity in breaths per minute.
    , max_respiration_rate FLOAT           -- Maximum respiration rate during the activity in breaths per minute.
    , avg_respiration_rate FLOAT           -- Average respiration rate during the activity in breaths per minute.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP           -- Timestamp when the record was last modified in the database.
    , FOREIGN KEY (activity_id) REFERENCES activity (activity_id) ON DELETE CASCADE
);
CREATE TABLE supplemental_activity_metric (
    activity_id BIGINT NOT NULL          -- References activity(activity_id).
    , metric TEXT NOT NULL                 -- Name of the metric being stored.
    , value FLOAT                          -- Numeric value of the metric.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP           -- Timestamp when the record was last modified in the database.
    , PRIMARY KEY (activity_id, metric)
    , FOREIGN KEY (activity_id) REFERENCES activity (activity_id) ON DELETE CASCADE
);
CREATE TABLE sleep (
    sleep_id INTEGER PRIMARY KEY         -- Auto-incrementing primary key for sleep session records.
    , user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user had this sleep session.
    , start_ts DATETIME NOT NULL           -- Sleep session start time.
    , end_ts DATETIME NOT NULL             -- Sleep session end time.
    , timezone_offset_hours FLOAT NOT NULL -- Timezone offset from UTC in hours to infer local time (e.g., -7.0 for UTC-07:00, 5.5 for UTC+05:30).
    , calendar_date TEXT                   -- Calendar date of the sleep session.
    , sleep_version INTEGER                -- Version of sleep tracking algorithm used.
    , age_group TEXT                       -- User age group category.
    , respiration_version INTEGER          -- Version of respiration tracking algorithm used.
    , sleep_time_seconds INTEGER           -- Total sleep time in seconds.
    , nap_time_seconds INTEGER             -- Total nap time in seconds.
    , unmeasurable_sleep_seconds INTEGER   -- Time spent in unmeasurable sleep in seconds.
    , deep_sleep_seconds INTEGER           -- Time spent in deep sleep in seconds.
    , light_sleep_seconds INTEGER          -- Time spent in light sleep in seconds.
    , rem_sleep_seconds INTEGER            -- Time spent in REM sleep in seconds.
    , awake_sleep_seconds INTEGER          -- Time spent awake during sleep session in seconds.
    , awake_count INTEGER                  -- Number of times user woke up during sleep.
    , restless_moments_count INTEGER       -- Total count of restless moments during sleep.
    , rem_sleep_data BOOLEAN               -- Whether REM sleep data is available for this session.
    , sleep_window_confirmed BOOLEAN       -- Whether the sleep window has been confirmed.
    , sleep_window_confirmation_type TEXT  -- Type of sleep window confirmation.
    , sleep_quality_type_pk BIGINT         -- Sleep quality type primary key identifier.
    , sleep_result_type_pk BIGINT          -- Sleep result type primary key identifier.
    , retro BOOLEAN                        -- Whether this is a retroactive sleep entry.
    , sleep_from_device BOOLEAN            -- Whether sleep data came from device or manual entry.
    , device_rem_capable BOOLEAN           -- Whether the device is capable of REM sleep detection.
    , skin_temp_data_exists BOOLEAN        -- Whether skin temperature data exists for this session.
    , average_spo2 FLOAT                   -- Average SpO2 (blood oxygen saturation) during sleep.
    , lowest_spo2 INTEGER                  -- Lowest SpO2 reading during sleep.
    , highest_spo2 INTEGER                 -- Highest SpO2 reading during sleep.
    , average_spo2_hr_sleep FLOAT          -- Average heart rate during SpO2 measurements.
    , number_of_events_below_threshold INTEGER -- Number of SpO2 events below alert threshold.
    , duration_of_events_below_threshold INTEGER -- Total duration of SpO2 events below threshold in seconds.
    , average_respiration FLOAT            -- Average respiration rate during sleep.
    , lowest_respiration FLOAT             -- Lowest respiration rate during sleep.
    , highest_respiration FLOAT            -- Highest respiration rate during sleep.
    , avg_sleep_stress FLOAT               -- Average stress level during sleep.
    , breathing_disruption_severity TEXT   -- Severity level of breathing disruptions.
    , avg_overnight_hrv FLOAT              -- Average heart rate variability during sleep.
    , hrv_status TEXT                      -- HRV status classification.
    , body_battery_change INTEGER          -- Change in body battery energy level during sleep.
    , resting_heart_rate INTEGER           -- Resting heart rate measured during sleep.
    , sleep_score_feedback TEXT            -- Sleep score feedback message.
    , sleep_score_insight TEXT             -- Sleep score insight message.
    , sleep_score_personalized_insight TEXT -- Personalized sleep score insight message.
    , total_duration_key TEXT              -- Sleep duration quality qualifier key.
    , stress_key TEXT                      -- Sleep stress level quality qualifier key.
    , awake_count_key TEXT                 -- Number of awakenings quality qualifier key.
    , restlessness_key TEXT                -- Sleep restlessness quality qualifier key.
    , score_overall_key TEXT               -- Overall sleep score quality qualifier key.
    , score_overall_value INTEGER          -- Overall sleep score numeric value (0-100 scale).
    , light_pct_key TEXT                   -- Light sleep percentage quality qualifier key.
    , light_pct_value INTEGER              -- Light sleep percentage numeric value.
    , deep_pct_key TEXT                    -- Deep sleep percentage quality qualifier key.
    , deep_pct_value INTEGER               -- Deep sleep percentage numeric value.
    , rem_pct_key TEXT                     -- REM sleep percentage quality qualifier key.
    , rem_pct_value INTEGER                -- REM sleep percentage numeric value.
    , sleep_need_baseline INTEGER          -- Baseline sleep need in minutes.
    , sleep_need_actual INTEGER            -- Actual sleep need in minutes.
    , sleep_need_feedback TEXT             -- Sleep need feedback.
    , sleep_need_training_feedback TEXT    -- Training-related sleep need feedback.
    , sleep_need_history_adj TEXT          -- Sleep history adjustment factor.
    , sleep_need_hrv_adj TEXT              -- HRV-based sleep need adjustment.
    , sleep_need_nap_adj TEXT              -- Nap-based sleep need adjustment.
    , next_sleep_need_baseline INTEGER     -- Next day baseline sleep need in minutes.
    , next_sleep_need_actual INTEGER       -- Next day actual sleep need in minutes.
    , next_sleep_need_feedback TEXT        -- Next day sleep need feedback.
    , next_sleep_need_training_feedback TEXT -- Next day training-related sleep need feedback.
    , next_sleep_need_history_adj TEXT     -- Next day sleep history adjustment factor.
    , next_sleep_need_hrv_adj TEXT         -- Next day HRV-based sleep need adjustment.
    , next_sleep_need_nap_adj TEXT         -- Next day nap-based sleep need adjustment.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP           -- Timestamp when the record was last modified in the database.
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
    , UNIQUE (user_id, start_ts)
);
CREATE INDEX sleep_user_id_start_ts_idx
ON sleep (user_id, start_ts DESC);
CREATE TABLE sleep_level (
    sleep_id INTEGER NOT NULL            -- References the sleep session identifier.
    , start_ts DATETIME NOT NULL           -- Start timestamp of the sleep stage interval.
    , end_ts DATETIME NOT NULL             -- End timestamp of the sleep stage interval.
    , stage INTEGER NOT NULL               -- Sleep stage code: 0=Deep, 1=Light, 2=REM, 3=Awake. Sourced from sleepLevels[*].activityLevel in the Garmin SLEEP JSON response.
    , stage_label TEXT NOT NULL            -- Human-readable sleep stage label (DEEP, LIGHT, REM, AWAKE) denormalized for query convenience.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (sleep_id, start_ts)
    , FOREIGN KEY (sleep_id) REFERENCES sleep (sleep_id) ON DELETE CASCADE
);
CREATE INDEX sleep_level_stage_idx
ON sleep_level (stage);
CREATE TABLE sleep_movement (
    sleep_id INTEGER NOT NULL            -- References the sleep session identifier.
    , timestamp DATETIME NOT NULL          -- Timestamp of the movement measurement.
    , activity_level FLOAT                 -- Movement activity level (higher values indicate more movement).
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (sleep_id, timestamp)
    , FOREIGN KEY (sleep_id) REFERENCES sleep (sleep_id) ON DELETE CASCADE
);
CREATE TABLE sleep_restless_moment (
    sleep_id INTEGER NOT NULL            -- References the sleep session identifier.
    , timestamp DATETIME NOT NULL          -- Timestamp of the restless moment.
    , value INTEGER                        -- Restless moments count.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (sleep_id, timestamp)
    , FOREIGN KEY (sleep_id) REFERENCES sleep (sleep_id) ON DELETE CASCADE
);
CREATE TABLE spo2 (
    sleep_id INTEGER NOT NULL            -- References the sleep session identifier.
    , timestamp DATETIME NOT NULL          -- Timestamp of the SpO2 measurement.
    , value INTEGER                        -- SpO2 reading as percentage (typically 85-100).
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (sleep_id, timestamp)
    , FOREIGN KEY (sleep_id) REFERENCES sleep (sleep_id) ON DELETE CASCADE
);
CREATE TABLE hrv (
    sleep_id INTEGER NOT NULL            -- References the sleep session identifier.
    , timestamp DATETIME NOT NULL          -- Timestamp of the HRV measurement.
    , value FLOAT                          -- HRV value in milliseconds.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (sleep_id, timestamp)
    , FOREIGN KEY (sleep_id) REFERENCES sleep (sleep_id) ON DELETE CASCADE
);
CREATE TABLE breathing_disruption (
    sleep_id INTEGER NOT NULL            -- References the sleep session identifier.
    , timestamp DATETIME NOT NULL          -- Timestamp of the breathing disruption event.
    , value INTEGER                        -- Breathing disruption severity or type indicator.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (sleep_id, timestamp)
    , FOREIGN KEY (sleep_id) REFERENCES sleep (sleep_id) ON DELETE CASCADE
);
CREATE TABLE vo2_max (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this VO2 max measurement belongs to.
    , date DATE NOT NULL                   -- Calendar date of the VO2 max measurement.
    , vo2_max_generic FLOAT                -- Generic VO2 max value in ml/kg/min.
    , vo2_max_cycling FLOAT                -- Cycling-specific VO2 max value in ml/kg/min.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP           -- Timestamp when the record was last modified in the database.
    , PRIMARY KEY (user_id, date)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE TABLE acclimation (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this acclimation data belongs to.
    , date DATE NOT NULL                   -- Calendar date of the acclimation measurement.
    , altitude_acclimation FLOAT           -- Altitude acclimation level as a numeric value.
    , heat_acclimation_percentage FLOAT    -- Heat acclimation level as a percentage (0-100).
    , current_altitude FLOAT               -- Current altitude in meters.
    , acclimation_percentage FLOAT         -- Overall acclimation percentage.
    , altitude_trend TEXT                  -- Altitude acclimation trend (e.g., ''MAINTAINING'', ''GAINING'').
    , heat_trend TEXT                      -- Heat acclimation trend (e.g., ''DEACCLIMATIZING'', ''ACCLIMATIZING'').
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP           -- Timestamp when the record was last modified in the database.
    , PRIMARY KEY (user_id, date)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE TABLE training_load (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this training load data belongs to.
    , date DATE NOT NULL                   -- Calendar date of the training load measurement.
    , monthly_load_aerobic_low FLOAT       -- Monthly aerobic low intensity training load.
    , monthly_load_aerobic_high FLOAT      -- Monthly aerobic high intensity training load.
    , monthly_load_anaerobic FLOAT         -- Monthly anaerobic training load.
    , monthly_load_aerobic_low_target_min FLOAT   -- Minimum target for monthly aerobic low intensity load.
    , monthly_load_aerobic_low_target_max FLOAT   -- Maximum target for monthly aerobic low intensity load.
    , monthly_load_aerobic_high_target_min FLOAT  -- Minimum target for monthly aerobic high intensity load.
    , monthly_load_aerobic_high_target_max FLOAT  -- Maximum target for monthly aerobic high intensity load.
    , monthly_load_anaerobic_target_min FLOAT     -- Minimum target for monthly anaerobic load.
    , monthly_load_anaerobic_target_max FLOAT     -- Maximum target for monthly anaerobic load.
    , training_balance_feedback_phrase TEXT -- Training balance feedback message (e.g., ''ABOVE_TARGETS'').
    , acwr_percent FLOAT                   -- Acute chronic workload ratio as a percentage.
    , acwr_status TEXT                     -- ACWR status classification (e.g., ''OPTIMAL'').
    , acwr_status_feedback TEXT            -- ACWR status feedback message.
    , daily_training_load_acute FLOAT      -- Daily acute training load value.
    , max_training_load_chronic FLOAT      -- Maximum chronic training load threshold.
    , min_training_load_chronic FLOAT      -- Minimum chronic training load threshold.
    , daily_training_load_chronic FLOAT    -- Daily chronic training load value.
    , daily_acute_chronic_workload_ratio FLOAT -- Daily acute to chronic workload ratio.
    , training_status INTEGER              -- Training status numeric code.
    , training_status_feedback_phrase TEXT -- Training status feedback message (e.g., ''STRAINED_1'').
    , total_intensity_minutes INTEGER      -- Total intensity minutes calculated as endDayMinutes - startDayMinutes.
    , moderate_minutes INTEGER             -- Daily moderate intensity minutes from intensity minutes tracking.
    , vigorous_minutes INTEGER             -- Daily vigorous intensity minutes from intensity minutes tracking.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP           -- Timestamp when the record was last modified in the database.
    , PRIMARY KEY (user_id, date)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE TABLE training_readiness (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this training readiness data belongs to.
    , timestamp DATETIME NOT NULL          -- Training readiness measurement timestamp.
    , timezone_offset_hours FLOAT NOT NULL -- Timezone offset from UTC in hours to infer local time (e.g., -7.0 for UTC-07:00, 5.5 for UTC+05:30).
    , level TEXT                           -- Training readiness level (e.g., ''HIGH'', ''MODERATE'', ''LOW'').
    , feedback_long TEXT                   -- Detailed training readiness feedback message.
    , feedback_short TEXT                  -- Short training readiness feedback message.
    , score INTEGER                        -- Overall training readiness score (0-100 scale).
    , sleep_score INTEGER                  -- Sleep quality score contributing to training readiness.
    , sleep_score_factor_percent INTEGER   -- Sleep score contribution percentage to overall readiness.
    , sleep_score_factor_feedback TEXT     -- Sleep score factor feedback (e.g., ''MODERATE'', ''GOOD'').
    , recovery_time INTEGER                -- Estimated recovery time in minutes.
    , recovery_time_factor_percent INTEGER -- Recovery time contribution percentage to overall readiness.
    , recovery_time_factor_feedback TEXT   -- Recovery time factor feedback (e.g., ''MODERATE'', ''GOOD'').
    , acwr_factor_percent INTEGER          -- Acute chronic workload ratio contribution percentage to overall readiness.
    , acwr_factor_feedback TEXT            -- ACWR factor feedback (e.g., ''GOOD'', ''VERY_GOOD'').
    , acute_load INTEGER                   -- Acute training load value.
    , stress_history_factor_percent INTEGER -- Stress history contribution percentage to overall readiness.
    , stress_history_factor_feedback TEXT  -- Stress history factor feedback (e.g., ''GOOD'').
    , hrv_factor_percent INTEGER           -- Heart rate variability contribution percentage to overall readiness.
    , hrv_factor_feedback TEXT             -- HRV factor feedback (e.g., ''GOOD'').
    , hrv_weekly_average INTEGER           -- Weekly average HRV value in milliseconds.
    , sleep_history_factor_percent INTEGER -- Sleep history contribution percentage to overall readiness.
    , sleep_history_factor_feedback TEXT   -- Sleep history factor feedback (e.g., ''MODERATE'').
    , valid_sleep BOOLEAN                  -- Whether sleep data is valid and available for calculation.
    , input_context TEXT                   -- Context of the training readiness calculation (e.g., ''UPDATE_REALTIME_VARIABLES'').
    , primary_activity_tracker BOOLEAN     -- Whether this device is the primary activity tracker.
    , recovery_time_change_phrase TEXT     -- Recovery time change feedback phrase.
    , sleep_history_factor_feedback_phrase TEXT -- Sleep history factor detailed feedback phrase.
    , hrv_factor_feedback_phrase TEXT      -- HRV factor detailed feedback phrase.
    , stress_history_factor_feedback_phrase TEXT -- Stress history factor detailed feedback phrase.
    , acwr_factor_feedback_phrase TEXT     -- ACWR factor detailed feedback phrase.
    , recovery_time_factor_feedback_phrase TEXT -- Recovery time factor detailed feedback phrase.
    , sleep_score_factor_feedback_phrase TEXT   -- Sleep score factor detailed feedback phrase.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was last modified in the database.
    , PRIMARY KEY (user_id, timestamp)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE INDEX training_readiness_user_id_timestamp_idx
ON training_readiness (user_id, timestamp DESC);
CREATE TABLE stress (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this stress measurement belongs to.
    , timestamp DATETIME NOT NULL          -- Timestamp of the stress measurement.
    , value INTEGER                        -- Stress level value (0-100 scale, negative values indicate unmeasurable periods).
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (user_id, timestamp)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE INDEX stress_user_id_timestamp_idx
ON stress (user_id, timestamp DESC);
CREATE TABLE body_battery (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this body battery measurement belongs to.
    , timestamp DATETIME NOT NULL          -- Timestamp of the body battery measurement.
    , value INTEGER                        -- Body battery energy level (0-100 scale).
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (user_id, timestamp)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE INDEX body_battery_user_id_timestamp_idx
ON body_battery (user_id, timestamp DESC);
CREATE TABLE heart_rate (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this heart rate measurement belongs to.
    , timestamp DATETIME NOT NULL          -- Timestamp of the heart rate measurement.
    , value INTEGER                        -- Heart rate value in beats per minute.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (user_id, timestamp)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE INDEX heart_rate_user_id_timestamp_idx
ON heart_rate (user_id, timestamp DESC);
CREATE TABLE steps (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this step count measurement belongs to.
    , timestamp DATETIME NOT NULL          -- Timestamp of the step count measurement.
    , value INTEGER                        -- Number of steps taken during the 15-minute interval.
    , activity_level TEXT                  -- Activity level classification (e.g., sleeping, sedentary, active, highlyActive).
    , activity_level_constant BOOLEAN      -- Whether the activity level remained constant during the interval.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (user_id, timestamp)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE INDEX steps_user_id_timestamp_idx
ON steps (user_id, timestamp DESC);
CREATE TABLE respiration (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this respiration measurement belongs to.
    , timestamp DATETIME NOT NULL          -- Timestamp of the respiration rate measurement.
    , value FLOAT                          -- Respiration rate value in breaths per minute.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (user_id, timestamp)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE INDEX respiration_user_id_timestamp_idx
ON respiration (user_id, timestamp DESC);
CREATE TABLE intensity_minutes (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this intensity minutes measurement belongs to.
    , timestamp DATETIME NOT NULL          -- Timestamp of the intensity minutes measurement.
    , value FLOAT                          -- Intensity minutes value representing accumulated moderate to vigorous activity.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (user_id, timestamp)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE INDEX intensity_minutes_user_id_timestamp_idx
ON intensity_minutes (user_id, timestamp DESC);
CREATE TABLE body_composition (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this weigh-in belongs to.
    , timestamp DATETIME NOT NULL          -- UTC timestamp of the weigh-in (timestampGMT from the API).
    , weight FLOAT                         -- Body weight in grams.
    , bmi FLOAT                            -- Body Mass Index.
    , body_fat FLOAT                       -- Body fat percentage (0-100).
    , body_water FLOAT                     -- Body water percentage (0-100).
    , bone_mass FLOAT                      -- Bone mass in grams.
    , muscle_mass FLOAT                    -- Muscle mass in grams.
    , physique_rating INTEGER              -- Garmin physique rating (1-9).
    , visceral_fat INTEGER                 -- Visceral fat rating.
    , metabolic_age INTEGER                -- Metabolic age in years.
    , source_type TEXT                     -- Origin of the measurement (e.g., ''INDEX_SCALE'', ''MANUAL'').
    , sample_pk BIGINT                     -- Garmin's stable per-sample ID (samplePk). Nullable for manual entries lacking the field. Use to reconcile deletions made in Garmin Connect.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (user_id, timestamp)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE INDEX body_composition_user_id_timestamp_idx
ON body_composition (user_id, timestamp DESC);
CREATE INDEX body_composition_sample_pk_idx
ON body_composition (sample_pk);
CREATE TABLE floors (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this floors measurement belongs to.
    , timestamp DATETIME NOT NULL          -- Timestamp of the floors measurement (endTimeGMT from the data).
    , ascended INTEGER                     -- Number of floors ascended during this measurement period.
    , descended INTEGER                    -- Number of floors descended during this measurement period.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (user_id, timestamp)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE INDEX floors_user_id_timestamp_idx
ON floors (user_id, timestamp DESC);
CREATE TABLE menstrual_cycle_day (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this log belongs to.
    , date DATE NOT NULL                   -- Calendar date of the log (dayLog.calendarDate, or the queried date when only daySummary is present).
    , cycle_start_date DATE                -- daySummary.startDate. Most recent period start anchoring this day's day-in-cycle.
    , day_in_cycle INTEGER                 -- 1-based day index within the current cycle (daySummary.dayInCycle).
    , period_length INTEGER                -- Length of the current period in days (daySummary.periodLength).
    , current_phase TEXT                   -- Denormalized phase label: MENSTRUAL / FOLLICULAR / OVULATORY / LUTEAL. Sourced from daySummary.currentPhase (1-4 int) via MenstrualCyclePhase.
    , length_of_current_phase INTEGER      -- daySummary.lengthOfCurrentPhase.
    , days_until_next_phase INTEGER        -- daySummary.daysUntilNextPhase.
    , predicted_cycle_length INTEGER       -- daySummary.predictedCycleLength.
    , cycle_type TEXT                      -- daySummary.cycleType (e.g., ''REGULAR'', ''IRREGULAR'').
    , predicted_cycle BOOLEAN              -- daySummary.predictedCycle. TRUE means the cycle is a projection, FALSE means a user-logged period.
    , flow TEXT                            -- dayLog.flow: NONE / LIGHT / MEDIUM / HEAVY. Nullable when not logged.
    , sex_drive TEXT                       -- dayLog.sexDrive: NONE / LOW / AVERAGE / HIGH. Nullable.
    , sexual_activity TEXT                 -- dayLog.sexualActivity: NONE / UNPROTECTED / PROTECTED. Nullable.
    , notes TEXT                           -- dayLog.notes. Freeform user text. Nullable.
    , report_ts DATETIME                   -- dayLog.reportTimestamp. Last time the user edited this day's log.
    , has_baby_movement BOOLEAN            -- dayLog.hasBabyMovement.
    , ovulation_day BOOLEAN                -- dayLog.ovulationDay. User-marked ovulation flag.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was last modified in the database.
    , PRIMARY KEY (user_id, date)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE INDEX menstrual_cycle_day_user_id_date_idx
ON menstrual_cycle_day (user_id, date DESC);
CREATE TABLE menstrual_cycle_tag (
    user_id BIGINT NOT NULL              -- References menstrual_cycle_day(user_id).
    , date DATE NOT NULL                   -- References menstrual_cycle_day(date).
    , kind TEXT NOT NULL                   -- One of: SYMPTOM, MOOD, DISCHARGE.
    , name TEXT NOT NULL                   -- Raw Garmin enum identifier for the tag.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (user_id, date, kind, name)
    , FOREIGN KEY (user_id, date) REFERENCES menstrual_cycle_day (
        user_id, date
    ) ON DELETE CASCADE
    , CONSTRAINT menstrual_cycle_tag_kind_valid CHECK (
        kind IN ('SYMPTOM', 'MOOD', 'DISCHARGE')
    )
);
CREATE INDEX menstrual_cycle_tag_kind_name_idx
ON menstrual_cycle_tag (kind, name);
CREATE TABLE menstrual_cycle_summary (
    user_id BIGINT NOT NULL              -- References user(user_id).
    , start_date DATE NOT NULL             -- cycleSummaries[].startDate. Day the period began (or is predicted to begin).
    , period_length INTEGER                -- cycleSummaries[].periodLength. Length of the period in days.
    , predicted_cycle BOOLEAN NOT NULL     -- cycleSummaries[].predictedCycle. TRUE for Garmin projections, FALSE for user-logged cycles.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was last modified in the database.
    , PRIMARY KEY (user_id, start_date)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE INDEX menstrual_cycle_summary_user_id_start_date_idx
ON menstrual_cycle_summary (user_id, start_date DESC);
CREATE INDEX menstrual_cycle_summary_predicted_cycle_idx
ON menstrual_cycle_summary (user_id, predicted_cycle);
CREATE TABLE personal_record (
    user_id BIGINT NOT NULL              -- Foreign key reference to the user profile.
    , activity_id BIGINT                    -- Garmin activity ID where this personal record was achieved.
    , timestamp DATETIME NOT NULL          -- Timestamp when the personal record was achieved (prStartTimeGmt).
    , type_id INTEGER NOT NULL             -- Personal record type identifier (e.g., 1=Run 1km, 3=Run 5km, 7=Run Longest).
    , label TEXT                           -- Human-readable description of the personal record type.
    , value FLOAT                          -- Value of the personal record (time in seconds for distances, distance in meters).
    , latest BOOLEAN NOT NULL DEFAULT 0    -- Boolean flag indicating whether this is the latest personal record for this user.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (user_id, type_id, timestamp)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
    -- Note: No FK on activity_id to allow processing PRs before activities exist.
);
CREATE UNIQUE INDEX personal_record_user_id_type_id_latest_idx
ON personal_record (user_id, type_id)
WHERE latest = 1;
CREATE INDEX personal_record_user_id_idx
ON personal_record (user_id);
CREATE INDEX personal_record_activity_id_idx
ON personal_record (activity_id);
CREATE INDEX personal_record_type_id_idx
ON personal_record (type_id);
CREATE INDEX personal_record_latest_idx
ON personal_record (latest);
CREATE TABLE race_predictions (
    user_id BIGINT NOT NULL              -- References user(user_id). Identifies which user this race prediction belongs to.
    , date DATE NOT NULL                   -- Calendar date of the race prediction.
    , time_5k FLOAT                        -- Predicted 5K race time in seconds.
    , time_10k FLOAT                       -- Predicted 10K race time in seconds.
    , time_half_marathon FLOAT             -- Predicted half marathon race time in seconds.
    , time_marathon FLOAT                  -- Predicted marathon race time in seconds.
    , latest BOOLEAN NOT NULL DEFAULT 0    -- Boolean flag indicating whether this is the latest race prediction for this user.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (user_id, date)
    , FOREIGN KEY (user_id) REFERENCES user (user_id)
);
CREATE UNIQUE INDEX race_predictions_user_id_latest_unique_idx
ON race_predictions (user_id)
WHERE latest = 1;
CREATE TABLE activity_ts_metric (
    activity_id BIGINT NOT NULL          -- References activity(activity_id). Identifies which activity this metric measurement belongs to.
    , timestamp DATETIME NOT NULL          -- Timestamp when the metric measurement was recorded.
    , name TEXT NOT NULL                   -- Name of the metric, which varies with activity type (e.g., heart_rate, cadence, power, position_lat, position_long).
    , value FLOAT                          -- Numeric value of the metric measurement.
    , units TEXT                           -- Units of measurement for the metric value (e.g., bpm, rpm, watts).
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (activity_id, timestamp, name)
    , FOREIGN KEY (activity_id) REFERENCES activity (activity_id) ON DELETE CASCADE
);
CREATE TABLE activity_split_metric (
    activity_id BIGINT NOT NULL          -- References activity(activity_id). Identifies which activity this split metric belongs to.
    , split_idx INTEGER NOT NULL           -- Split index number starting from 1, incrementing for each split frame in the activity.
    , name TEXT NOT NULL                   -- Name of the metric (e.g., total_elapsed_time, total_distance, avg_speed).
    , split_type TEXT                      -- Type of split segment (e.g., rwd_run, rwd_walk, rwd_stand, interval_active).
    , value FLOAT                          -- Numeric value of the split metric measurement.
    , units TEXT                           -- Units of measurement for the metric value (e.g., s, km, km/h).
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (activity_id, split_idx, name)
    , FOREIGN KEY (activity_id) REFERENCES activity (activity_id) ON DELETE CASCADE
);
CREATE TABLE activity_lap_metric (
    activity_id BIGINT NOT NULL          -- References activity(activity_id). Identifies which activity this lap metric belongs to.
    , lap_idx INTEGER NOT NULL             -- Lap index number starting from 1, incrementing for each lap frame in the activity.
    , name TEXT NOT NULL                   -- Name of the metric (e.g., timestamp, start_time, total_elapsed_time, distance).
    , value FLOAT                          -- Numeric value of the lap metric measurement.
    , units TEXT                           -- Units of measurement for the metric value (e.g., s, m, deg).
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (activity_id, lap_idx, name)
    , FOREIGN KEY (activity_id) REFERENCES activity (activity_id) ON DELETE CASCADE
);
CREATE TABLE activity_path (
    activity_id BIGINT NOT NULL          -- References activity(activity_id). Identifies which activity this GPS path belongs to. One row per activity.
    , path_json JSON NOT NULL              -- Ordered array of [longitude, latitude] coordinate pairs in decimal degrees, sorted ascending by timestamp. Format: [[lon, lat], [lon, lat], ...]. Stored as JSON (TEXT in SQLite) and validated via CHECK constraints.
    , point_count INTEGER NOT NULL         -- Number of GPS coordinate pairs in path_json. Denormalized for cheap filtering without parsing JSON.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , PRIMARY KEY (activity_id)
    , FOREIGN KEY (activity_id) REFERENCES activity (activity_id) ON DELETE CASCADE
    , CONSTRAINT activity_path_path_json_valid CHECK (JSON_VALID(path_json))
    , CONSTRAINT activity_path_path_json_is_array CHECK (JSON_TYPE(path_json) = 'array')
    , CONSTRAINT activity_path_point_count_matches CHECK (
        JSON_ARRAY_LENGTH(path_json) = point_count
    )
);
CREATE INDEX activity_path_point_count_idx
ON activity_path (point_count);
CREATE TABLE strength_exercise (
    activity_id BIGINT NOT NULL          -- References activity(activity_id). Identifies which activity this exercise belongs to.
    , exercise_category TEXT NOT NULL      -- Exercise category (e.g., BENCH_PRESS, CURL).
    , exercise_name TEXT NOT NULL          -- Exercise sub-category or name (e.g., BARBELL_BENCH_PRESS, DUMBBELL_CURL).
    , sets INTEGER                         -- Number of sets performed for this exercise.
    , reps INTEGER                         -- Total number of repetitions across all sets.
    , volume FLOAT                         -- Total volume (weight x reps) in grams.
    , duration_ms FLOAT                    -- Total duration of all sets in milliseconds.
    , max_weight FLOAT                     -- Maximum weight used across all sets in grams.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was last modified in the database.
    , PRIMARY KEY (activity_id, exercise_category, exercise_name)
    , FOREIGN KEY (activity_id) REFERENCES activity (activity_id) ON DELETE CASCADE
);
CREATE INDEX strength_exercise_exercise_category_idx
ON strength_exercise (exercise_category);
CREATE INDEX strength_exercise_exercise_name_idx
ON strength_exercise (exercise_name);
CREATE TABLE strength_set (
    activity_id BIGINT NOT NULL          -- References activity(activity_id). Identifies which activity this set belongs to.
    , set_idx INTEGER NOT NULL             -- Set index from API messageIndex (may have gaps).
    , set_type TEXT NOT NULL               -- Type of set (ACTIVE, REST, WARMUP, DROP_SET, FAILURE).
    , start_time DATETIME                  -- Timestamp when the set started.
    , duration FLOAT                       -- Duration of the set in seconds.
    , wkt_step_index INTEGER               -- Workout step index if from a structured workout.
    , repetition_count INTEGER             -- Number of repetitions in this set.
    , weight FLOAT                         -- Weight used in grams.
    , exercise_category TEXT               -- ML-classified exercise category (e.g., BENCH_PRESS). NULL for REST sets.
    , exercise_name TEXT                    -- ML-classified exercise name (e.g., BARBELL_BENCH_PRESS). NULL for REST sets.
    , exercise_probability FLOAT           -- ML classification probability (0.0-1.0). NULL for REST sets.
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was created in the database.
    , update_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the record was last modified in the database.
    , PRIMARY KEY (activity_id, set_idx)
    , FOREIGN KEY (activity_id) REFERENCES activity (activity_id) ON DELETE CASCADE
);
CREATE INDEX strength_set_set_type_idx
ON strength_set (set_type);
CREATE INDEX strength_set_exercise_category_idx
ON strength_set (exercise_category);
CREATE INDEX strength_set_exercise_name_idx
ON strength_set (exercise_name);
CREATE TABLE activity_ts_metric_downsampled (
    activity_id BIGINT NOT NULL          -- References activity(activity_id). Identifies which activity this bucket belongs to.
    , bucket_ts DATETIME NOT NULL          -- Bucket start timestamp (UTC), aligned to multiples of bucket_seconds from activity.start_ts so buckets never span activity boundaries.
    , name TEXT NOT NULL                   -- Metric name carried over from activity_ts_metric (e.g., heart_rate, cadence, power, distance, accumulated_power).
    , bucket_seconds INTEGER NOT NULL      -- Bucket width in seconds. The grain used by the downsample run that produced this row (e.g., 60 for 1-minute buckets, 300 for 5-minute). Metadata, not part of row identity.
    , value FLOAT                          -- Bucket value. For AGGREGATE strategy: arithmetic mean over the bucket window. For LAST strategy: last-in-bucket value (cumulative metrics like distance and accumulated_power).
    , min_value FLOAT                      -- Bucket minimum value for AGGREGATE strategy. NULL for LAST strategy (a single representative value is the whole point).
    , max_value FLOAT                      -- Bucket maximum value for AGGREGATE strategy. NULL for LAST strategy.
    , sample_count INTEGER NOT NULL        -- Number of source rows from activity_ts_metric that contributed to this bucket. Useful for spotting sparse buckets (e.g., from intermittent sensor signals).
    , units TEXT                           -- Units of measurement carried over from activity_ts_metric (e.g., bpm, rpm, watts, m).
    , create_ts DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp when this bucket row was last (re)computed by 'garmin downsample'.
    , PRIMARY KEY (activity_id, bucket_ts, name)
    , FOREIGN KEY (activity_id) REFERENCES activity (activity_id) ON DELETE CASCADE
);
CREATE INDEX activity_ts_metric_downsampled_name_bucket_ts_idx
ON activity_ts_metric_downsampled (name, bucket_ts DESC);
CREATE TABLE blood_panels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    test_name TEXT NOT NULL,
    value REAL,
    unit TEXT,
    ref_low REAL,
    ref_high REAL,
    flags TEXT,
    notes TEXT,
    source TEXT DEFAULT 'manual',
    create_ts DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    meal_type TEXT,
    protein REAL,
    fat REAL,
    carbs REAL,
    calories REAL,
    notes TEXT,
    source TEXT DEFAULT 'manual',
    create_ts DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE body_comp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    weight REAL,
    bf_pct REAL,
    smm REAL,
    fat_mass REAL,
    lean_mass REAL,
    ecw_tbw REAL,
    notes TEXT,
    source TEXT DEFAULT 'manual',
    create_ts DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE activity_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            activity_id BIGINT NOT NULL,
            category TEXT NOT NULL,
            duration_min REAL,
            calories INTEGER,
            avg_hr INTEGER,
            max_hr INTEGER,
            distance_miles REAL,
            type_key TEXT,
            aerobic_te REAL,
            source TEXT DEFAULT 'garmin',
            create_ts DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(date, activity_id)
        );
CREATE INDEX idx_activity_date ON activity_summary(date);
CREATE INDEX idx_activity_cat ON activity_summary(category);
CREATE TABLE daily_health_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            sleep_score REAL,
            sleep_duration_min REAL,
            rem_min REAL,
            deep_min REAL,
            hrv REAL,
            resting_hr INTEGER,
            spo2_avg REAL,
            spo2_low REAL,
            body_battery_avg REAL,
            body_battery_max REAL,
            stress_avg REAL,
            total_steps INTEGER,
            total_intensity_min REAL,
            strength_count INTEGER,
            zone2_count INTEGER,
            source TEXT DEFAULT 'pipeline'
        );
CREATE INDEX idx_daily_date ON daily_health_summary(date);
